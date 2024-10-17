---
title: Elasticsearch
author: Se7en
categories:
  - Interview
tags:
  - Elasticsearch
---

## Elasticsearch 性能优化

### 查询相关

#### 充分利用缓存

- **使用过滤器上下文（Filter）替代查询上下文（Query）**：Filter不会进行打分操作，而 Must 会，Filter 查询可以被缓存，从而提高查询性能。
- **只关注聚合结果而不关注文档细节时，Size 设置为 0 利用分片查询缓存。**
- **日期范围查询使用绝对时间值**：日期字段上使用 Now，一般来说不会被缓存，因为匹配到的时间一直在变化。因此， 可以从业务的角度来考虑是否一定要用 Now，尽量使用绝对时间值，不需要解析相对时间表达式且利用 Query Cache 能够提高查询效率。例如时间范围查询中使用 Now/h，使用小时级别的单位，可以让缓存在 1 小时内都可能被访问到。

#### 聚合查询

- **嵌套聚合建议使用 Composite 聚合查询方式**：对于常见的 Group by A,B,C 这种多维度 Groupby 查询，嵌套聚合的性能很差，嵌套聚合被设计为在每个桶内进行指标计算，对于平铺的 Group by 来说有存在很多冗余计算，另外在 Meta 字段上的序列化反序列化代价也非常大，这类 Group by 替换为 Composite 可以将查询速度提升 2 倍左右。

```json
GET my-products/_search
{
  "size": 0,
  "aggs": {
    "by_brand": {
      "terms": {
        "field": "brand"
      },
      "aggs": {
        "by_color": {
          "terms": {
            "field": "color"
          },
          "aggs": {
            "total_price": {
              "sum": {
                "field": "price"
              }
            }
          }
        }
      }
    }
  }
}

// 推荐：使用 Composite 聚合可以实现类似功能，并支持分页返回聚合结果。我们按 brand 和 color 聚合，并统计 price 的总和。
GET my-products/_search
{
  "size": 0,
  "aggs": {
    "composite_agg": {
      "composite": {
        "sources": [
          { "brand": { "terms": { "field": "brand" } } },
          { "color": { "terms": { "field": "color" } } }
        ]
      },
      "aggs": {
        "total_price": {
          "sum": {
            "field": "price"
          }
        }
      }
    }
  }
}
```

- **高基数场景嵌套聚合查询建议使用 BFS 搜索。**

聚合是在 Elasticsearch 内存完成的。当一个聚合操作包含了嵌套的聚合操作时，每个嵌套的聚合操作都会使用上一级聚合操作中构建出的桶作为输入，然后根据自己的聚合条件再进行桶的进一步分组。这样对于每一层嵌套，都会再次动态构建一组新的聚合桶。在高基数场景，嵌套聚合操作会导致聚合桶数量随着嵌套层数的增加指数级增长，最终结果就是占用 ES 大量内存，从而导致 OOM 的情况发生。

默认情况下，Elasticsearch 使用 DFS（深度优先）搜索。深度优先先构建完整的树，然后修剪无用节点。BFS（广度优先）先执行第一层聚合，再继续下一层聚合之前会先做修剪。

在聚合查询中，使用广度优先算法需要在每个桶级别上缓存文档数据，然后在剪枝阶段后向子聚合重放这些文档。因此，广度优先算法的内存消耗取决于每个桶中的文档数量。对于许多聚合查询，每个桶中的文档数量都非常大，聚合可能会有数千或数十万个文档。

但是，有大量桶但每个桶中文档数量相对较少的情况下，使用广度优先算法能更加高效地利用内存资源，而且可以让我们构建更加复杂的聚合查询。虽然可能会产生大量的桶，但每个桶中只有相对较少的文档，因此使用广度优先搜索算法可以更加节约内存。

```json
GET /_search
{
  "aggs": {
    "actors": {
      "terms": {
        "field": "actors",
        "size": 10,
        "collect_mode": "breadth_first"  // 当基数大于 size 时，默认也会使用 BFS 模式
      },
      "aggs": {
        "costars": {
          "terms": {
            "field": "actors",
            "size": 5
          }
        }
      }
    }
  }
}
```

- **避免对 text 字段类型使用聚合查询**：text 的 fielddata 会加大对内存的占用，如有需求使用，建议使用 keyword。
- **不建议使用 bucket_sort 进行聚合深分页查询。**

Elasticsearch 的高 Cardinality 聚合查询非常消耗内存，超过百万基数的聚合很容易导致节点内存不够用以至 OOM。

bucket_sort 使用桶排序算法，性能问题主要是由于它需要在内存中缓存所有的文档和聚合桶，然后才能进行排序和分页，随着文档数量增多和分页深度增加，性能会逐渐变差，有深分页问题。因为桶排序需要对所有文档进行整体排序，所以它的时间复杂度是 O(NlogN)，其中 N 是文档总数。

目前Elasticsearch支持聚合分页（滚动聚合）的目前只有复合聚合(Composite Aggregation)一种。滚动的方式类似于SearchAfter。聚合时指定一个复合键，然后每个分片都按照这个复合键进行排序和聚合，不需要在内存中缓存所有文档和桶，而是可以每次返回一页的数据。

- **对需要聚合查询的高基数 Keyword 字段启用 Eager_Global_Ordinals。**

terms 聚合依赖于一种称为[全局序数](https://www.elastic.co/guide/en/elasticsearch/reference/current/eager-global-ordinals.html#_what_are_global_ordinals)的内部数据结构。该结构为给定字段的每个唯一值维护统计信息。这些统计信息在分片级别计算，并在缩减阶段进一步合并，以生成最终结果。

全局序数的计算是一个昂贵的操作，因为它需要在每个分片上对字段值进行排序，然后将排序后的值映射到全局唯一的整数。这个过程需要大量的 CPU 和内存资源，特别是在高基数字段上。 
因此全局序数默认是延迟计算的，只有在上一次刷新后运行的第一次 terms 聚合时才会计算。这意味着第一次使用 terms 聚合时，会有一定的延迟。如果你的集群中有大量的高基数字段，你可能会发现这种延迟是不可接受的，因为全局序数将频繁地重新计算。

如果你愿意牺牲写入的性能来换取更快的聚合查询，你可以通过设置 `eager_global_ordinals: true` 来强制 Elasticsearch 在每次刷新后立即计算全局序数。这样可以减少聚合查询的延迟，但会增加写入的成本。

参考资料：
- [Elasticsearch Global Ordinals, Eager Global Ordinals & High Cardinality Fields](https://opster.com/guides/elasticsearch/data-architecture/elasticsearch-global-ordinals-high-cardinality/)
- [Elasticsearch Global Ordinals](https://blog.csdn.net/UbuntuTouch/article/details/131432429)

#### 分页

- **避免使用 from+size 方式**：Elasticsearch 中深度翻页排序的花费会随着分页的深度而成倍增长，分页搜索不会单独“Cache”。每次分页的请求都是一次重新搜索的过程，而不是从第一次搜索的结果中获取。如果数据特别大对 CPU 和内存的消耗会非常巨大甚至会导致 OOM。
- **避免高实时性&大结果集场景使用 Scroll 方式。**

基于快照的上下文。实时性高的业务场景不建议使用。大结果集场景将生成大量Scroll 上下文，可能导致内存消耗过大，建议使用 SearcheAfter 方式。

思考：对于 Scroll 和 SearchAfter 的选用怎么看？两者分别适用于哪种场景？SearchAfter 可以完全替代 Scroll 吗？

Scroll 维护一份当前索引段的快照，适用于非实时滚动遍历全量数据查询，但大量 Contexts 占用堆内存的代价较高；7.10 引入的新特性 Search After + PIT，查询本质是利用前向页面的一组排序之检索匹配下一页，从而保证数据一致性；8.10 官方文档明确指出不再建议使用 Scroll API 进行深分页。如果分页检索超过 Top10000+ 推荐使用 PIT + Search After。

- **Scroll 查询确保显式调用 clearScroll() 方法清除 Scroll ID。**

否则会导致 ES 在过期时间前无法释放 Scroll 结果集占用的内存资源，同时也会占用默认 3000 个 Scroll 查询的容量，导致 too many scroll ID 的查询拒绝报错，影响业务。


#### 其他

- **脚本使用 Stored 方式，避免使用 Inline 方式。**

对于固定结构的 Script，使用 Stored 方式，把脚本通过 Kibana 存入 ES 集群，降低重复编译脚本带来的性能损耗。

```json
// 正例
// 第 1 步：通过 stored 方式，创建 script 模版：
POST _script/activity_discount_price
{
  "script":{
        "lang":"painless",
        "source":"doc.xxx.value * params.discount"
  }
}

// 第 2 步：调用 script 脚本模版：cal_activity_discount
GETindex/_search{
  "script_fields": {
    "discount_price": {
      "script": {
        "id": "activity_discount_price",
        "params": {
          "discount": 0.8
        }
      }
    }
  }
}

// 反例
// 直接 inline 方式，在请求中传入脚本：
GET index/_search
{
  "script_fields": {
    "activity_discount_price": {
      "script": {
           "source":"doc.xxx.value * 0.8"
      }
    }
  }
}
```

- **避免使用 _all 字段。**

_all 字段包含了所有的索引字段，如果没有获取原始文档数据的需求，可通过设置Includes、Excludes 属性来定义放入 _source 的字段。_all 默认将写入的字段拼接成一个大的字符串，并对该字段进行分词，用于支持整个 Doc 的全文检索，“_all”字段在查询时占用更多的 CPU，同时占用更多的磁盘存储空间，默认为“false”，不建议开启该字段和使用。

- **建议用 Get 查询替换 Search 查询。**

GET/MGET 直接根据文档 ID 从正排索引中获取内容。Search 不指定 _id，根据关键词从倒排索引中获取内容。

- **避免单次召回大量数据，建议使用 _source_includes 和 _source_excludes 参数来包含或排除字段。** 对大型文档尤其有用，部分字段检索可以节省网络开销。

- **避免使用 Wildcard 进行中缀模糊查询。**

Elasticsearch 官方文档并不推荐使用 Wildcard 来进行中缀模糊的查询，原因在于 ES 内部为了加速这种带有通配符查询，会将输入的字符串 Pattern 构建成一个 DFA (Deterministic Finite Automaton)，而带有通配符的 Pattern 构造出来的 DFA 可能会很复杂，开销很大。

建议使用 Elasticsearch 官方在 7.9 推出的一种专门用来解决模糊查询慢的 Wildcard 字段类型。与 Text 字段相比，它不会将文本看作是标点符号分割的单词集合；与 Keyword 字段比，它在中缀搜索场景下具有无与伦比的查询速度，且对输入没有大小限制，这是 Keyword 类型无法相比的。

- **尽量避免使用 Scripting。**

Painless 脚本语言语法相对简单，灵活度高，安全性高，性能高（相对于其他脚本，但是其性能比 DSL 要低）。不适用于非复杂业务，一般 DSL 能解决大部分的问题，解决不了的用类似 Painless 等脚本语言。主要性能影响如下：单次查询或更新耗时增加，脚本的执行时间相比于其他查询和更新操作可能会更长，因为在执行脚本之前需要对其进行词法分析、语法分析和代码编译等预处理工作。

- **避免使用脚本查询（Script Query）计算动态字段，建议在索引时计算并在文档中添加该字段。**

例如，我们有一个包含大量用户信息的索引，我们需要查询以 "1234" 开头的所有用户。运行一个脚本查询如 `"source": "doc['num'].value.startsWith('1234')"`。这个查询非常耗费资源，索引时考虑添加一个名为 "num_prefix" 的 keyword 字段，然后查询 `"name_prefix": "1234"`。

- **设置 index sorting 优化排序性能。**

在 Elasticsearch 中创建新索引时，可以配置如何对每个分片内的 segments 进行排序。默认情况下，Lucene 不进行任何排序。`index.sort` 设置定义应使用哪些字段对每个 segments 中的文档进行排序，从而提升指定字段的排序性能。

```json
PUT events
{
  "settings": {
    "index": {
      "sort.field": "timestamp",
      "sort.order": "desc" 
    }
  },
  "mappings": {
    "properties": {
      "timestamp": {
        "type": "date"
      }
    }
  }
}

// 对 timestamp 字段进行排序时，性能会更好
GET /events/_search
{
  "size": 10,
  "sort": [
    { "timestamp": "desc" }
  ]
}
```
### 写入相关

- **合理设置 Refresh Interval，避免频繁刷新。** 默认情况下，Elasticsearch 每秒刷新一次，这意味着每秒都会刷新一次索引，这会导致大量的磁盘 I/O，降低写入性能。可以根据业务需求调整刷新策略，例如设置为 30s 或 60s。
- **避免单个文档过大。** 默认 http.max_content_length 设置为 100MB，Elasticsearch 将拒绝索引任何大于该值的文档。
- **写入数据不指定 doc_id，让 Elasticsearch 自动生成。** 索引具有显式 ID 的文档时 Elasticsearch 在写入过程中会多一步判断的过程，即检查具有相同 ID 的文档是否已经存在于相同的分片中，随着索引增长而变得更加昂贵。
- **合理使用 Bulk API 批量写。**

大数据量写入时可以使用 Bulk，但是请求响应的耗时会增加，即使连接断开，Elasticsearch 集群内部也仍然在执行。高速大批量数据写入时，可能造成集群短时间内响应缓慢甚至假死的的情况。
- 可以通过性能测试确定最佳数量，官方建议大约 5-15 MB。
- 超时时间需要足够长，建议 60s 以上。
- 写入端尽量将数据轮询打到不同节点上。

### 索引创建

#### 分片

- **副本分片数大于等于 1。** 

高可用性保证。增加副本数可以一定程度上提高搜索性能；但会降低写入性能，建议每个主分片对应 1-2 个副本分片即可。

- **官方建议单分片限制最大数据条数不超过 2^32 - 1。**

- **单个分片数据量不要超过 50GB。** 单个索引的规模控制在 1TB 以内，单个分片大小控制在 30 ~ 50GB ，Docs 数控制在 10 亿内，如果超过建议滚动。


#### Mapping 映射

- **避免使用字段动态映射功能，指定具体字段类型，子类型（若需要），分词器（特别有场景需要）。**
- **对于不需要分词的字符串字段，使用 keyword 类型而不是 text 类型。**
- **Elasticsearch 默认字段个数最大 1000，建议不要超过 100。**

单个 Doc 在建立索引时的运算复杂度，最大的因素不在于 Doc 的字节数或者说某个字段 Value 的长度，而是字段的数量。例如在满负载的写入压力测试中，Mapping 相同的情况下，一个有 10 个字段，200 字节的 Doc， 通过增加某些字段 Value 的长度到 500 字节，写入 Elasticsearch 时速度下降很少，而如果字段数增加到 20，即使整个 Doc 字节数没增加多少，写入速度也会降低一倍。

- **对于不索引的字段，`index` 属性设置为 false。**

在下面的例子中，title 字段的 `index` 属性被设置为 false，表示该字段不会被包含在索引中。而 context 字段的 `index` 属性默认为 true，表示该字段会被包含在索引中。需要注意的是，即使 `index` 属性被设置为 false，该字段仍然会被保存在文档中，可以被查询和聚合。

```json
{
  "mappings": {
    "properties": {
      "title": {
        "type": "text",
        "index": false
      },
      "content": {
        "type": "text"
      }
    }
  }
}
```

- **避免使用 Nested 或 Parent/Child 查询。**

Nested 查询慢，Parent/Child 查询更慢，针对 1 个 Document，每一个 Nested Field 都会生成一个独立的 Document，这将使 Doc 数量剧增，影响查询效率尤其是 JOIN 的效率。因此能在 Mapping 设计阶段搞定的（大宽表设计或采用比较 Smart 的数据结构），就不要用父子关系的 Mapping。如果一定要使用 Nested Fields，保证 Nested Fields 字段不能过多，目前 Elasticsearch 默认限制是 `index.mapping.nested_fields.limit=50`。不建议使用 Nested，那有什么方式来解决 Elasticsearch 无法 JOIN 的问题？主要有几种实现方式：
- 在文档建模上尽可能在设计时将业务转化有关联关系的文档形式，使用扁平的文档模型。
- 独立索引存储，实际业务层分多次请求实现。
- 通过宽表冗余存储避免关联。

否则 Nested 和 Parent/Child 存储对性能均有一定影响，由于 Nested 更新子文档时需要 Reindex 整个文档，所以对写入性能影响较大，适用于 1 对 n（n 较小）场景；Parent/Child 存储在相同 Type中，写入相比 Nested 性能高，用于 1 对 n（n 较大）场景，但比 Nested 查询更慢，官网说是 5-10 倍左右。

- **对于不需要评分的 text 字段，禁用 norms。**

norms 是索引评分因子，如果不用按评分对文档进行排序，设置为 false。

对于 Text 类型的字段而言，默认开启了 norms，而 keyword 类型的字段则默认关闭了 norms。

开启 norms 之后，每篇文档的每个字段需要一个字节存储 norms。对于 text 类型的字段而言是默认开启 norms 的，因此对于不需要评分的 text 类型的字段，可以禁用 norms。

- **对不需要进行聚合/排序的字段禁用列存 doc_values。**

面向列的方式存储，主要用户排序、聚合和访问脚本中字段值等数据访问场景。几乎所有字段类型都支持 doc_values，值得注意的是，需要分析的字符串字段除外。默认情况下，所有支持 doc_values 的字段都启用了这个功能。如果确定不需要对字段进行排序或聚合，或从脚本访问字段值，则可以禁用此功能以减少冗余存储成本。

### 参考资料

- [一口气看完43个关于 ElasticSearch 的使用建议｜得物技术](https://mp.weixin.qq.com/s/Gsa1rPVISjOdVteol78EoA)
- [Tune for search speed](https://www.elastic.co/guide/en/elasticsearch/reference/current/tune-for-search-speed.html#_search_rounded_dates)
