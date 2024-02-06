---
title: 使用 Envoy 作为前端代理
author: Se7en
date: 2022/05/03 20:00
categories:
- 原创
tags:
- Envoy
---

# 使用 Envoy 作为前端代理

## 环境介绍

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20210315224532.png)

在本例中一共部署了3个容器：
* front-envoy 容器作为 API 网关，所有的入向请求都通过 front-envoy 容器进行路由。front-envoy 容器暴露了 8080，8443 端口分别来接受 HTTP，HTTPS 请求，并根据路径分别将它们路由到对应的服务上，以及通过 8001 端口来接受 Envoy 自带的 admin 服务。
* 分别部署 service1 和 service2 两个Flask 应用程序，在该容器中启动 Envoy 服务， 通过 loopback 地址将请求路由到 Flask 应用程序。

## service1 & service2 服务代码
service1 和 service2 都使用相同的代码启动 Flask 服务，通过 SERVICE_NAME 这个环境变量在访问的时候可以区分服务是 service1 还是 service2 。
```python
# service.py
from flask import Flask
from flask import request
import os
import requests
import socket
import sys

app = Flask(__name__)


@app.route('/service/<service_number>')
def hello(service_number):
  return ('Hello from behind Envoy (service {})! hostname: {} resolved'
          'hostname: {}\n'.format(os.environ['SERVICE_NAME'], socket.gethostname(),
                                  socket.gethostbyname(socket.gethostname())))

if __name__ == "__main__":
  app.run(host='127.0.0.1', port=8080, debug=True)
```

## service1 & service2 的 envoy 服务配置
在 service1 和 service2 容器中还启动了 envoy 服务，外部客户端（本例中是 front-envoy 容器）访问 service1 和 service2 时是去访问 envoy , 然后由 envoy 通过 loopback 地址 将请求路由到 Flask 应用程序。
```yaml
# service-envoy.yaml
static_resources:  #定义静态资源
  listeners:  #监听器
  - address:
      socket_address:
        address: 0.0.0.0  #envoy监听地址
        port_value: 8000  #envoy监听端口号
    filter_chains:
    - filters:
      - name: cr7_filters #自定义filters的名字
        typed_config:
          #https://www.envoyproxy.io/docs/envoy/latest/api-v3/extensions/filters/network/http_connection_manager/v3/http_connection_manager.proto
          "@type": type.googleapis.com/envoy.extensions.filters.network.http_connection_manager.v3.HttpConnectionManager
          codec_type: auto  #默认配置，connection manager 使用的编解码器，自动适配HTTP/1.1和HTTP/2
          stat_prefix: ingress_http #connection manager 发出统计信息时使用的前缀
          route_config:  #静态配置路由管理，可选参数有3个：rds（通过RDS API动态加载）,route_config（静态）,scoped_routes（根据请求参数匹配路）
            name: cr7_route  #自定义路由配置名称
            virtual_hosts: #定义一组虚拟主机
            - name: cr7_service  #自定义虚拟主机名称
              domains: #匹配所有域名
              - "*"
              routes:
              - match:
                  prefix: "/service" #匹配的URI路径
                route:
                  cluster: cr7_cluster #上游集群名称
          http_filters:
           - name: envoy.filters.http.router  #实现HTTP转发
          # - name: cr7-router
          #   typed_config:
          #      "@type": type.googleapis.com/envoy.extensions.filters.http.router.v3.Router
  clusters:
  - name: cr7_cluster  #自定义上游集群名称
    connect_timeout: 0.25s #新连接到上游集群主机的超时时间
    #https://www.envoyproxy.io/docs/envoy/latest/api-v3/config/cluster/v3/cluster.proto#envoy-v3-api-enum-config-cluster-v3-cluster-discoverytype
    type: strict_dns  #服务发现机制：通过域名解析
    lb_policy: round_robin #负载均衡策略
    load_assignment: #设置负载均衡的成员， 取代了V2 API中的hosts字段
      cluster_name: cr7_upstream
      endpoints:
      - lb_endpoints:
        - endpoint:
            address:
              socket_address:
                address: 127.0.0.1 #通过loopback转发给本地flask服务
                port_value: 8080

#https://www.envoyproxy.io/docs/envoy/latest/api-v3/config/bootstrap/v3/bootstrap.proto.html?highlight=access_log_path#envoy-v3-api-msg-config-bootstrap-v3-admin
admin: #envoy管理接口
  access_log_path: "/tmp/access.log"
  address:
    socket_address:
      address: 0.0.0.0
      port_value: 8001
```
## service1 & service2 Dockerfile 文件

service1 和 service2 容器启动脚本：首先启动Flask 服务，然后启动 envoy 服务。
```sh
# start_service.sh
#!/bin/sh
python3 /code/service.py &
envoy -c /etc/service-envoy.yaml --service-cluster "service${SERVICE_NAME}"
```

```yaml
#Dockerfile-service
FROM envoyproxy/envoy-alpine-dev:latest

RUN apk update && apk add py3-pip bash curl
RUN pip3 install -q Flask==0.11.1 requests==2.18.4
RUN mkdir /code
ADD ./service.py /code
ADD ./start_service.sh /usr/local/bin/start_service.sh
RUN chmod u+x /usr/local/bin/start_service.sh
ENTRYPOINT ["/bin/sh", "/usr/local/bin/start_service.sh"]
```

## front-envoy envoy 配置文件
front-envoy 容器中只有 envoy 服务， 负责接收所有入访的流量，并且根据URI请求路径分发给service1 或者 service2 。另外还配置了 HTTPS 加密，生成了证书和私钥。
```yaml
# front-envoy.yaml
static_resources:
  listeners:
  - address:
      socket_address:
        address: 0.0.0.0
        port_value: 8080
    filter_chains:
    - filters:
      - name: envoy.filters.network.http_connection_manager
        typed_config:
          "@type": type.googleapis.com/envoy.extensions.filters.network.http_connection_manager.v3.HttpConnectionManager
          codec_type: auto
          stat_prefix: ingress_http
          route_config:
            name: local_route
            virtual_hosts:
            - name: backend
              domains:
              - "*"
              routes:
              - match:
                  prefix: "/service/1"
                route:
                  cluster: service1
              - match:
                  prefix: "/service/2"
                route:
                  cluster: service2
          http_filters:
          - name: envoy.filters.http.router
            typed_config: {}

  - address:
      socket_address:
        address: 0.0.0.0
        port_value: 8443
    filter_chains:
    - filters:
      - name: envoy.filters.network.http_connection_manager
        typed_config:
          "@type": type.googleapis.com/envoy.extensions.filters.network.http_connection_manager.v3.HttpConnectionManager
          codec_type: auto
          stat_prefix: ingress_http
          route_config:
            name: local_route
            virtual_hosts:
            - name: backend
              domains:
              - "*"
              routes:
              - match:
                  prefix: "/service/1"
                route:
                  cluster: service1
              - match:
                  prefix: "/service/2"
                route:
                  cluster: service2
          http_filters:
          - name: envoy.filters.http.router
            typed_config: {}

      transport_socket:
        name: envoy.transport_sockets.tls
        typed_config:
          "@type": type.googleapis.com/envoy.extensions.transport_sockets.tls.v3.DownstreamTlsContext
          common_tls_context:
            tls_certificates:
              # The following self-signed certificate pair is generated using:
              # $ openssl req -x509 -newkey rsa:2048 -keyout a/front-proxy-key.pem -out  a/front-proxy-crt.pem -days 3650 -nodes -subj '/CN=front-envoy'
              #
              # Instead of feeding it as an inline_string, certificate pair can also be fed to Envoy
              # via filename. Reference: https://www.envoyproxy.io/docs/envoy/latest/api-v3/config/core/v3/base.proto#config-core-v3-datasource.
              #
              # Or in a dynamic configuration scenario, certificate pair can be fetched remotely via
              # Secret Discovery Service (SDS). Reference: https://www.envoyproxy.io/docs/envoy/latest/configuration/security/secret.
              certificate_chain:
                inline_string: |
                  -----BEGIN CERTIFICATE-----
                  MIICqDCCAZACCQCquzpHNpqBcDANBgkqhkiG9w0BAQsFADAWMRQwEgYDVQQDDAtm
                  cm9udC1lbnZveTAeFw0yMDA3MDgwMTMxNDZaFw0zMDA3MDYwMTMxNDZaMBYxFDAS
                  BgNVBAMMC2Zyb250LWVudm95MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKC
                  AQEAthnYkqVQBX+Wg7aQWyCCb87hBce1hAFhbRM8Y9dQTqxoMXZiA2n8G089hUou
                  oQpEdJgitXVS6YMFPFUUWfwcqxYAynLK4X5im26Yfa1eO8La8sZUS+4Bjao1gF5/
                  VJxSEo2yZ7fFBo8M4E44ZehIIocipCRS+YZehFs6dmHoq/MGvh2eAHIa+O9xssPt
                  ofFcQMR8rwBHVbKy484O10tNCouX4yUkyQXqCRy6HRu7kSjOjNKSGtjfG+h5M8bh
                  10W7ZrsJ1hWhzBulSaMZaUY3vh5ngpws1JATQVSK1Jm/dmMRciwlTK7KfzgxHlSX
                  58ENpS7yPTISkEICcLbXkkKGEQIDAQABMA0GCSqGSIb3DQEBCwUAA4IBAQCmj6Hg
                  vwOxWz0xu+6fSfRL6PGJUGq6wghCfUvjfwZ7zppDUqU47fk+yqPIOzuGZMdAqi7N
                  v1DXkeO4A3hnMD22Rlqt25vfogAaZVToBeQxCPd/ALBLFrvLUFYuSlS3zXSBpQqQ
                  Ny2IKFYsMllz5RSROONHBjaJOn5OwqenJ91MPmTAG7ujXKN6INSBM0PjX9Jy4Xb9
                  zT+I85jRDQHnTFce1WICBDCYidTIvJtdSSokGSuy4/xyxAAc/BpZAfOjBQ4G1QRe
                  9XwOi790LyNUYFJVyeOvNJwveloWuPLHb9idmY5YABwikUY6QNcXwyHTbRCkPB2I
                  m+/R4XnmL4cKQ+5Z
                  -----END CERTIFICATE-----
              private_key:
                inline_string: |
                  -----BEGIN PRIVATE KEY-----
                  MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC2GdiSpVAFf5aD
                  tpBbIIJvzuEFx7WEAWFtEzxj11BOrGgxdmIDafwbTz2FSi6hCkR0mCK1dVLpgwU8
                  VRRZ/ByrFgDKcsrhfmKbbph9rV47wtryxlRL7gGNqjWAXn9UnFISjbJnt8UGjwzg
                  Tjhl6EgihyKkJFL5hl6EWzp2Yeir8wa+HZ4Achr473Gyw+2h8VxAxHyvAEdVsrLj
                  zg7XS00Ki5fjJSTJBeoJHLodG7uRKM6M0pIa2N8b6HkzxuHXRbtmuwnWFaHMG6VJ
                  oxlpRje+HmeCnCzUkBNBVIrUmb92YxFyLCVMrsp/ODEeVJfnwQ2lLvI9MhKQQgJw
                  tteSQoYRAgMBAAECggEAeDGdEkYNCGQLe8pvg8Z0ccoSGpeTxpqGrNEKhjfi6NrB
                  NwyVav10iq4FxEmPd3nobzDPkAftfvWc6hKaCT7vyTkPspCMOsQJ39/ixOk+jqFx
                  lNa1YxyoZ9IV2DIHR1iaj2Z5gB367PZUoGTgstrbafbaNY9IOSyojCIO935ubbcx
                  DWwL24XAf51ez6sXnI8V5tXmrFlNXhbhJdH8iIxNyM45HrnlUlOk0lCK4gmLJjy9
                  10IS2H2Wh3M5zsTpihH1JvM56oAH1ahrhMXs/rVFXXkg50yD1KV+HQiEbglYKUxO
                  eMYtfaY9i2CuLwhDnWp3oxP3HfgQQhD09OEN3e0IlQKBgQDZ/3poG9TiMZSjfKqL
                  xnCABMXGVQsfFWNC8THoW6RRx5Rqi8q08yJrmhCu32YKvccsOljDQJQQJdQO1g09
                  e/adJmCnTrqxNtjPkX9txV23Lp6Ak7emjiQ5ICu7iWxrcO3zf7hmKtj7z+av8sjO
                  mDI7NkX5vnlE74nztBEjp3eC0wKBgQDV2GeJV028RW3b/QyP3Gwmax2+cKLR9PKR
                  nJnmO5bxAT0nQ3xuJEAqMIss/Rfb/macWc2N/6CWJCRT6a2vgy6xBW+bqG6RdQMB
                  xEZXFZl+sSKhXPkc5Wjb4lQ14YWyRPrTjMlwez3k4UolIJhJmwl+D7OkMRrOUERO
                  EtUvc7odCwKBgBi+nhdZKWXveM7B5N3uzXBKmmRz3MpPdC/yDtcwJ8u8msUpTv4R
                  JxQNrd0bsIqBli0YBmFLYEMg+BwjAee7vXeDFq+HCTv6XMva2RsNryCO4yD3I359
                  XfE6DJzB8ZOUgv4Dvluie3TB2Y6ZQV/p+LGt7G13yG4hvofyJYvlg3RPAoGAcjDg
                  +OH5zLN2eqah8qBN0CYa9/rFt0AJ19+7/smLTJ7QvQq4g0gwS1couplcCEnNGWiK
                  72y1n/ckvvplmPeAE19HveMvR9UoCeV5ej86fACy8V/oVpnaaLBvL2aCMjPLjPP9
                  DWeCIZp8MV86cvOrGfngf6kJG2qZTueXl4NAuwkCgYEArKkhlZVXjwBoVvtHYmN2
                  o+F6cGMlRJTLhNc391WApsgDZfTZSdeJsBsvvzS/Nc0burrufJg0wYioTlpReSy4
                  ohhtprnQQAddfjHP7rh2LGt+irFzhdXXQ1ybGaGM9D764KUNCXLuwdly0vzXU4HU
                  q5sGxGrC1RECGB5Zwx2S2ZY=
                  -----END PRIVATE KEY-----

  clusters:
  - name: service1
    connect_timeout: 0.25s
    type: strict_dns  #服务发现机制：通过域名解析
    lb_policy: round_robin
    http2_protocol_options: {}
    load_assignment:
      cluster_name: service1
      endpoints:
      - lb_endpoints:
        - endpoint:
            address:
              socket_address:
                address: service1 # 通过 DNS 解析 service1 可以得到 service1 容器的 IP 地址
                port_value: 8000
  - name: service2
    connect_timeout: 0.25s
    type: strict_dns
    lb_policy: round_robin
    http2_protocol_options: {}
    load_assignment:
      cluster_name: service2
      endpoints:
      - lb_endpoints:
        - endpoint:
            address:
              socket_address:
                address: service2
                port_value: 8000
admin:
  access_log_path: "/dev/null"
  address:
    socket_address:
      address: 0.0.0.0
      port_value: 8001
layered_runtime:
  layers:
    - name: static_layer_0
      static_layer:
        envoy:
          resource_limits:
            listener:
              example_listener_name:
                connection_limit: 10000
```

## front-envoy Dockerfile 文件

```yaml
# Dockerfile-frontenvoy
FROM envoyproxy/envoy-dev:latest

RUN apt-get update && apt-get -q install -y \
    curl
COPY ./front-envoy.yaml /etc/front-envoy.yaml
RUN chmod go+r /etc/front-envoy.yaml
CMD ["/usr/local/bin/envoy", "-c", "/etc/front-envoy.yaml", "--service-cluster", "front-proxy"]
```

## docker-compose.yml 文件

```yaml
# docker-compose.yaml
version: "3.7"
services:

  front-envoy:
    build:
      context: .
      dockerfile: Dockerfile-frontenvoy  
    networks:
      - envoymesh
    expose:
      - "8080"
      - "8443"
      - "8001"
    ports:
      - "8080:8080"
      - "8443:8443"
      - "8001:8001"

  service1:
    build:
      context: .
      dockerfile: Dockerfile-service
    volumes:
      - ./service-envoy.yaml:/etc/service-envoy.yaml
    networks:
      envoymesh:
        aliases:
          - service1
    environment:
      - SERVICE_NAME=1  #通过环境变量来区分服务
    expose:
      - "8000"

  service2:
    build:
      context: .
      dockerfile: Dockerfile-service
    volumes:
      - ./service-envoy.yaml:/etc/service-envoy.yaml
    networks:
      envoymesh:
        aliases:
          - service2
    environment:
      - SERVICE_NAME=2
    expose:
      - "8000"

networks:
  envoymesh: {}
```

## 运行验证

### 步骤一： 安装 Docker
确保你已安装较新版本的 docker 和 docker-compose 。

### 步骤二：克隆仓库

```
git clone https://github.com/cr7258/envoy-lab.git
```

### 步骤三：启动所有容器
* **up**：启动容器
* **-d**： 在后台运行
* **--build**：重新构建镜像

```sh
cd envoy-lab/front-proxy
docker-compose up -d --build
```
查看容器：

```sh
[root@envoy ~]# docker-compose  ps
       Name                     Command               State                                         Ports
-----------------------------------------------------------------------------------------------------------------------------------------------
root_front-envoy_1   /docker-entrypoint.sh /usr ...   Up      10000/tcp, 0.0.0.0:8001->8001/tcp, 0.0.0.0:8080->8080/tcp, 0.0.0.0:8443->8443/tcp
root_service1_1      /bin/sh /usr/local/bin/sta ...   Up      10000/tcp, 8000/tcp
root_service2_1      /bin/sh /usr/local/bin/sta ...   Up      10000/tcp, 8000/tcp
```
### 步骤四：测试 Envoy 的路由能力
你现在可以通过 front-envoy 向两个服务发送请求。

向 service1 发请求：

```sh
[root@envoy ~]# curl -v localhost:8080/service/1
* About to connect() to localhost port 8080 (#0)
*   Trying ::1...
* Connected to localhost (::1) port 8080 (#0)
> GET /service/1 HTTP/1.1
> User-Agent: curl/7.29.0
> Host: localhost:8080
> Accept: */*
>
< HTTP/1.1 200 OK
< content-type: text/html; charset=utf-8
< content-length: 89
< server: envoy
< date: Mon, 15 Mar 2021 15:29:28 GMT
< x-envoy-upstream-service-time: 2
<
Hello from behind Envoy (service 1)! hostname: e60ba6d0671c resolvedhostname: 172.18.0.2
```
向 service2 发请求：

```sh
[root@envoy ~]# curl -v localhost:8080/service/2
* About to connect() to localhost port 8080 (#0)
*   Trying ::1...
* Connected to localhost (::1) port 8080 (#0)
> GET /service/2 HTTP/1.1
> User-Agent: curl/7.29.0
> Host: localhost:8080
> Accept: */*
>
< HTTP/1.1 200 OK
< content-type: text/html; charset=utf-8
< content-length: 89
< server: envoy
< date: Mon, 15 Mar 2021 15:29:32 GMT
< x-envoy-upstream-service-time: 2
<
Hello from behind Envoy (service 2)! hostname: 9727cf7b9303 resolvedhostname: 172.18.0.4
* Connection #0 to host localhost left intact
```
能看到，每个请求在发送给前端 Envoy 后被正确路由到相应的应用程序。

我们也可以通过 HTTPS 请求前端 Envoy 后的服务。例如，向 service1：

```sh
[root@envoy ~]# curl https://localhost:8443/service/1 -k -v
* About to connect() to localhost port 8443 (#0)
*   Trying ::1...
* Connected to localhost (::1) port 8443 (#0)
* Initializing NSS with certpath: sql:/etc/pki/nssdb
* skipping SSL peer certificate verification
* SSL connection using TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256
* Server certificate:
* 	subject: CN=front-envoy
* 	start date: 7月 08 01:31:46 2020 GMT
* 	expire date: 7月 06 01:31:46 2030 GMT
* 	common name: front-envoy
* 	issuer: CN=front-envoy
> GET /service/1 HTTP/1.1
> User-Agent: curl/7.29.0
> Host: localhost:8443
> Accept: */*
>
< HTTP/1.1 200 OK
< content-type: text/html; charset=utf-8
< content-length: 89
< server: envoy
< date: Mon, 15 Mar 2021 15:30:10 GMT
< x-envoy-upstream-service-time: 2
<
Hello from behind Envoy (service 1)! hostname: e60ba6d0671c resolvedhostname: 172.18.0.2
* Connection #0 to host localhost left intact
```

### 步骤五：测试 Envoy 的负载均衡能力
现在增加 service1 的节点数量来演示 Envoy 的负载均衡能力：

```sh
[root@envoy ~]# docker-compose scale service1=3
WARNING: The scale command is deprecated. Use the up command with the --scale flag instead.
Starting root_service1_1 ... done
Creating root_service1_2 ... done
Creating root_service1_3 ... done
```

现在，如果我们多次向 service1 发送请求，前端 Envoy 将通过 round-robin 轮询三台 service1 机器来实现负载均衡：

```sh
docker-compose exec -T front-envoy bash -c "\
                   curl -s http://localhost:8080/service/1 \
                   && curl -s http://localhost:8080/service/1 \
                   && curl -s http://localhost:8080/service/1" \
                   | grep Hello | grep "service 1"
                   
               
# 返回结果
Hello from behind Envoy (service 1)! hostname: 707d6f830af2 resolvedhostname: 172.18.0.5
Hello from behind Envoy (service 1)! hostname: 64eebf06b9db resolvedhostname: 172.18.0.6
Hello from behind Envoy (service 1)! hostname: e60ba6d0671c resolvedhostname: 172.18.0.2
```

### 步骤六：进入容器并 curl admin
当 Envoy 启动时，也会同时启动一个 admin 服务并绑定指定的端口。
在示例配置中 admin 绑定到了 8001 端口。

我们可以通过 curl 它获得有用的信息：

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20210315233403.png)

```sh
[root@envoy ~]# curl localhost:8001/stats
cluster.service1.external.upstream_rq_200: 7
...
cluster.service1.membership_change: 2
cluster.service1.membership_total: 3
...
cluster.service1.upstream_cx_http2_total: 3
...
cluster.service1.upstream_rq_total: 7
...
cluster.service2.external.upstream_rq_200: 2
...
cluster.service2.membership_change: 1
cluster.service2.membership_total: 1
...
cluster.service2.upstream_cx_http2_total: 1
...
cluster.service2.upstream_rq_total: 2
...
```
能看到，我们可以获取上游集群的成员数量，它们完成的请求数量，有关 http 入口的信息以及大量其他有用的统计数据。

## 欢迎关注
![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20210306213609.png)
