import{_ as e,o as a,c as t,R as s}from"./chunks/framework.FHZ5yb6k.js";const h=JSON.parse('{"title":"消息队列","description":"","frontmatter":{"title":"消息队列","author":"Se7en","categories":["Interview"],"tags":["Message Queue"]},"headers":[],"relativePath":"courses/interview/大数据/01-message-queue.md","filePath":"courses/interview/大数据/01-message-queue.md","lastUpdated":1729736003000}'),r={name:"courses/interview/大数据/01-message-queue.md"},i=s('<h2 id="kafka" tabindex="-1">Kafka <a class="header-anchor" href="#kafka" aria-label="Permalink to &quot;Kafka&quot;">​</a></h2><h3 id="kafka-为什么快" tabindex="-1">Kafka 为什么快？ <a class="header-anchor" href="#kafka-为什么快" aria-label="Permalink to &quot;Kafka 为什么快？&quot;">​</a></h3><p>Kafka 之所以有着出色的性能，主要有以下几个原因：</p><ul><li><strong>磁盘顺序读写</strong>：生产者发送数据到 Kafka 集群中，最终会写入到磁盘中，会采用顺序写入的方式。消费者从 Kafka 集群中获取数据时，也是采用顺序读的方式。无论是机械磁盘还是固态硬盘 SSD，顺序读写的速度都是远大于随机读写的。因为对于机械磁盘顺序读写省去了磁头频繁寻址和旋转盘片的开销。</li><li><strong>PageCache 页缓存技术</strong>：Kafka利用操作系统的PageCache来优化读写性能。当数据被写入时，它首先存储在内存中的 PageCache 中，再定期批量写入磁盘。这种设计减少了直接对磁盘的 I/O 操作，提高了读取速度，因为读取操作可以直接从缓存中获取数据。 <img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202410231222882.png" alt=""></li><li><strong>零拷贝技术</strong>：Kafka 通过 sendfile 零拷贝技术在内核态将数据从 PageCache 直接拷贝到了 Socket 缓冲区，大大减少了用户态和内核态之间的切换以及数据拷贝。 <img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202410231225237.png" alt=""></li><li><strong>分区架构与批量操作</strong>：一方面 Kafka 的集群架构采用了多分区技术，并行度高。另外一方面，Kafka 采用了批量操作。生产者发送的消息先发送到一个队列，然后有 sender 线程批量发送给 Kafka 集群。</li></ul><p>参考资料：</p><ul><li><a href="https://xie.infoq.cn/article/51b6764c48ff70988e124a868" target="_blank" rel="noreferrer">面试官问：kafka 为什么如此之快？</a></li></ul>',6),n=[i];function o(c,l,f,g,u,_){return a(),t("div",null,n)}const d=e(r,[["render",o]]);export{h as __pageData,d as default};
