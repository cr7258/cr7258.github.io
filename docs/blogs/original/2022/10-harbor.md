---
title: Habor 部署指南
author: Se7en
date: 2022/09/03 20:00
categories:
- 原创
tags:
- Harbor
---

# Habor 部署指南

## Harbor 介绍
Harbor 是由 VMware 开源的一款云原生制品仓库，Harbor 的核心功能是存储和管理 Artifact。Harbor 允许用户用命令行工具对容器镜像及其他 Artifact 进行推送和拉取，并提供了图形管理界面帮助用户查看和管理这些 Artifact。
在 Harbor 2.0 版本中，除容器镜像外，Harbor 对符合 OCI 规范的 Helm Chart、CNAB、OPA Bundle 等都提供了更多的支持。

## Harbor 整体架构

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20210810222737.png)

如上图所示是 Harbor 2.0 的架构图，从上到下可分为代理层、功能层和数据层。
* **代理层**：代理层实质上是一个 Nginx 反向代理，负责接收不同类型的客户端请求，包括浏览器、用户脚本、Docker 等，并根据请求类型和 URI 转发给不同的后端服务进行处理。
* **功能层**：
    * **Portal**：是一个基于 Argular 的前端应用，提供 Harbor 用户访问的界面。
    * **Core**：是 Harbor 中的核心组件，封装了 Harbor 绝大部分的业务逻辑。
    * **JobService**：异步任务组件，负责 Harbor 中很多比较耗时的功能，比如 Artifact 复制、扫描、垃圾回收等。
    * **Docker Distribution**：Harbor 通过 Distribution 实现 Artifact 的读写和存取等功能。
    * **RegistryCtl**：Docker Distribution 的控制组件。
    * **Notary（可选）**：基于 TUF 提供镜像签名管理的功能。
    * **扫描工具（可选）**：镜像的漏洞检测工具。
    * **ChartMuseum（可选）**：提供 API 管理非 OCI 规范的 Helm Chart，随着兼容 OCI 规范的 Helm Chart 在社区上被更广泛地接受，Helm Chart 能以 Artifact 的形式在 Harbor 中存储和管理，不再依赖 ChartMuseum，因此 Harbor 可能会在后续版本中移除对 ChartMuseum 的支持。
* **数据层**：
    * **Redis**：主要作为缓存服务存储一些生命周期较短的数据，同时对于 JobService 还提供了类似队列的功能。
    * **PostgreSQL**：存储 Harbor 的应用数据，比如项目信息、用户与项目的关系、管理策略、配置信息、Artifact 的元数据等等。
    * **Artifact 存储**：存储 Artifact 本身的内容，也就是每次推送镜像、Helm Chart 或其他 Artifact 时，数据最终存储的地方。默认情况下，Harbor 会把 Artifact 写入本地文件系统中。用户也可以修改配置，将 Artifact 存储在外部存储中，例如亚马逊的对象存储 S3、谷歌云存储 GCS、阿里云的对象存储 OSS 等等。

## Docker Compose 部署 Harbor
### 前提要求

硬件要求：

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20210806225940.png)

软件要求：

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20210806225949.png)

### 下载安装包

```sh
wget https://github.com/goharbor/harbor/releases/download/v2.3.1/harbor-offline-installer-v2.3.1.tgz
tar -xzvf harbor-offline-installer-v2.3.1.tgz
cd harbor
```


### 修改配置文件

拷贝模板文件为 harbor.yml。
```sh
cp harbor.yml.tmpl harbor.yml
```
编辑 harbor.yml 配置文件，hostname 是 harbor 对外暴露的访问地址，HTTP 服务对外暴露 8888 端口。这里暂时先不配置 HTTPS，将 HTTPS 相关内容注释。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20210727114813.png)

### 部署 Harbor

修改完配置文件后，只需要执行 install.sh 脚本即可安装 Harbor。
```sh
./install.sh
```

查看 Harbor 组件运行状况：

```sh
> docker-compose ps 
      Name                     Command                  State                        Ports                  
------------------------------------------------------------------------------------------------------------
harbor-core         /harbor/entrypoint.sh            Up (healthy)                                           
harbor-db           /docker-entrypoint.sh 96 13      Up (healthy)                                           
harbor-jobservice   /harbor/entrypoint.sh            Up (healthy)                                           
harbor-log          /bin/sh -c /usr/local/bin/ ...   Up (healthy)   127.0.0.1:1514->10514/tcp               
harbor-portal       nginx -g daemon off;             Up (healthy)                                           
nginx               nginx -g daemon off;             Up (healthy)   0.0.0.0:8888->8080/tcp,:::8888->8080/tcp
redis               redis-server /etc/redis.conf     Up (healthy)                                           
registry            /home/harbor/entrypoint.sh       Up (healthy)                                           
registryctl         /home/harbor/start.sh            Up (healthy)  
```
### 登录页面
浏览器输入 http://11.8.36.21:8888 访问 Harbor 页面，用户名和密码为 harbor.yml 配置文件中默认设置的 admin，Harbor12345。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20210729124757.png)

### 推送镜像

从公网拉取一个 nginx:1.19 版本的镜像：
```sh
> docker pull nginx:1.19
1.19: Pulling from library/nginx
69692152171a: Already exists 
49f7d34d62c1: Pull complete 
5f97dc5d71ab: Pull complete 
cfcd0711b93a: Pull complete 
be6172d7651b: Pull complete 
de9813870342: Pull complete 
Digest: sha256:df13abe416e37eb3db4722840dd479b00ba193ac6606e7902331dcea50f4f1f2
Status: Downloaded newer image for nginx:1.19
```

编辑 /etc/docker/daemon.json，设置允许访问的 HTTP 仓库地址。
```json
{
  "insecure-registries":["11.8.36.21:8888"]
}
```

修改镜像 tag：
```sh
docker tag nginx:1.19 11.8.36.21:8888/library/nginx:1.19
```

登录 Harbor：
```sh
> docker login 11.8.36.21:8888
Username: admin
Password: 
Login Succeeded
```

推送镜像到 Harbor：
```sh
> docker push 11.8.36.21:8888/library/nginx:1.19
The push refers to a repository [11.8.36.21:8888/library/nginx]
f0f30197ccf9: Pushed 
eeb14ff930d4: Pushed 
c9732df61184: Pushed 
4b8db2d7f35a: Pushed 
431f409d4c5a: Pushed 
02c055ef67f5: Pushed 
1.19: digest: sha256:eba373a0620f68ffdc3f217041ad25ef084475b8feb35b992574cd83698e9e3c size: 1570
```

查看推送的镜像：

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20210729125742.png)

### HTTPS 配置（可选）

在生产环境中建议配置 HTTPS，可以使用由受信任的第三方 CA 签名的证书，也可以使用自签名证书。如果想要启用 Content Trust with Notary 来正确签名所有图像，则必须使用 HTTPS。


#### 创建目录

首先创建目录存放生成的证书。
```sh
mkdir /root/cert
cd /root/cert/
```
#### 生成 CA 证书

本次实验中我们使用自签名证书。生产环境中应使用受信任的第三方 CA 签名的证书。

#####  生成 CA 证书私钥


```sh
openssl genrsa -out ca.key 4096
```

##### 生成 CA 证书

-subj 表示证书的组织。CN 后面的值改成 harbor 的 IP 地址或者域名。

```sh
openssl req -x509 -new -nodes -sha512 -days 3650 \
 -subj "/C=CN/ST=Beijing/L=Beijing/O=example/OU=Personal/CN=11.8.36.21" \
 -key ca.key \
 -out ca.crt
```

#### 生成 Server 证书

生成 Harbor 使用的证书和私钥。

##### 生成 Server 私钥

```sh
openssl genrsa -out server.key 4096
```

##### 生成 Server 证书签名请求（CSR）

生成 Harbor 的证书签名请求，使用上面生成的 CA 证书来给 Server 签发证书。

```sh
openssl req -sha512 -new \
    -subj "/C=CN/ST=Beijing/L=Beijing/O=example/OU=Personal/CN=11.8.36.21" \
    -key server.key \
    -out server.csr
```

##### 生成 x509 v3 扩展文件
通过 docker 或者 ctr 等工具拉取 HTTPS 的镜像时，要求 HTTPS 的证书包含 SAN 扩展。

SAN（Subject Alternative Name） 是 SSL 标准 x509 中定义的一个扩展。使用了 SAN 字段的 SSL 证书，可以扩展此证书支持的域名，使得一个证书可以支持多个不同域名的解析。例如下图中 Google 的这张证书的主题备用名称（SAN）中列了一大串的域名，因此这张证书能够被多个域名所使用。对于 Google 这种域名数量较多的公司来说，使用这种类型的证书能够极大的简化网站证书的管理。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20210806205842.png)

使用以下命令生成 x509 v3 扩展文件：
```sh
cat > v3.ext <<-EOF
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth
subjectAltName = IP:11.8.36.21
EOF
```

如果是域名访问通过下面方式生成 x509 v3 扩展文件：

```sh
cat > v3.ext <<-EOF
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
DNS.1=yourdomain.harbor.com
EO
```
##### 使用 CA 证书签发 Server 证书

```sh
openssl x509 -req -sha512 -days 3650 \
    -extfile v3.ext \
    -CA ca.crt -CAkey ca.key -CAcreateserial \
    -in server.csr \
    -out server.crt
```

查看当前目录生成的文件：
```sh
root@ydt-net-portainer:/root/cert #ll 
total 32
-rw-r--r-- 1 root root 2025 Aug  6 20:44 ca.crt 
-rw-r--r-- 1 root root 3243 Aug  6 20:40 ca.key  
-rw-r--r-- 1 root root   17 Aug  6 21:03 ca.srl
-rw-r--r-- 1 root root 2045 Aug  6 21:03 server.crt
-rw-r--r-- 1 root root 1704 Aug  6 20:47 server.csr
-rw-r--r-- 1 root root 3247 Aug  6 20:45 server.key
-rw-r--r-- 1 root root  202 Aug  6 21:00 v3.ext
```
####  为 Harbor 和 Docker 配置证书

##### 将 server 证书和密钥复制到 Harbor 主机上的 /data/cert 目录中
```sh
mkdir -p /data/cert
cp server.crt /data/cert/
cp server.key /data/cert/
```
##### 转换 server.crt 为 server.cert
Docker 守护程序会认为 .crt 文件是 CA 证书，因此需要将 server 证书转换为 server.cert 文件。其实改下后缀就可以了，证书里面的内容是一样的。

```sh
openssl x509 -inform PEM -in server.crt -out server.cert
```
##### 将 server 证书，密钥和 CA 证书复制到 Harbor 主机上的 Docker 证书目录中

需要提前创建好 Docker 证书目录，如果使用 443 端口监听 HTTPS 请求，则目录为 IP/域名 即可，如果使用非 443 端口，则目录为 IP/域名:端口。

```sh
mkdir -p /etc/docker/certs.d/11.8.36.21:8443
cp server.cert /etc/docker/certs.d/11.8.36.21:8443
cp server.key /etc/docker/certs.d/11.8.36.21:8443
cp ca.crt /etc/docker/certs.d/11.8.36.21:8443
```

查看 Docker 证书目录文件：
```sh
root@ydt-net-portainer:/root/cert #ll /etc/docker/certs.d/11.8.36.21:8443/
total 12
-rw-r--r-- 1 root root 2025 Aug  6 21:15 ca.crt
-rw-r--r-- 1 root root 2045 Aug  6 21:15 server.cert
-rw-r--r-- 1 root root 3247 Aug  6 21:15 server.key
```

##### 重启 Docker Engine

```sh
systemctl restart docker
```

#### 重新部署 Harbor

修改 harbor.yml 配置文件，添加 HTTPS 相关配置，指定 HTTPS 的端口号和证书路径:

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20210806212011.png)

#### 使用 prepare 脚本生成 HTTPS 配置
使用 prepare 脚本为反向代理 Nginx 容器生成 HTTPS 配置。

```sh
./prepare
```

#### 删除原有 Harbor 容器

Harbor 原有的数据文件默认是挂载在宿主机的 /data 目录下，因此删除 Harbor 容器并不会丢失数据。

```sh
docker-compose down -v
```
#### 重新启动 Harbor

```sh
docker-compose up -d
```

#### 登录 HTTPS 页面

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20210806212959.png)

#### Docker 拉取和推送镜像

Docker 想要拉取或者推送 HTTPS 镜像仓库的镜像，需要在 Docker 证书目录中配置证书，这里的 Docker 客户端是另一台机器，首先在这台机器上创建目录。

```sh
mkdir /etc/docker/certs.d/11.8.36.21:8443
```

然后从 Harbor 主机拷贝证书文件到 Docker 客户端上，需要 server 的证书和密钥以及 CA 证书。

```sh
scp /root/cert/server.key  root@11.8.36.95:/etc/docker/certs.d/11.8.36.21:8443
scp /root/cert/server.cert  root@11.8.36.95:/etc/docker/certs.d/11.8.36.21:8443
scp /root/cert/ca.crt  root@11.8.36.95:/etc/docker/certs.d/11.8.36.21:8443
```

拉取镜像：

```sh
root@ydt-net-nginx-cisp:/root #docker pull 11.8.36.21:8443/library/nginx:1.19
Trying to pull repository 11.8.36.21:8443/library/nginx ... 
1.19: Pulling from 11.8.36.21:8443/library/nginx
Digest: sha256:eba373a0620f68ffdc3f217041ad25ef084475b8feb35b992574cd83698e9e3c
Status: Downloaded newer image for 11.8.36.21:8443/library/nginx:1.19
```

推送镜像：

```sh
#登录 Harbor 镜像仓库
root@ydt-net-nginx-cisp:/root #docker login https://11.8.36.21:8443
Username: admin
Password: 
Login Succeeded

#给镜像打 tag，换个名字
root@ydt-net-nginx-cisp:/root #docker tag 11.8.36.21:8443/library/nginx:1.19 11.8.36.21:8443/library/nginx-2:1.19

#推送镜像
root@ydt-net-nginx-cisp:/root #docker push 11.8.36.21:8443/library/nginx-2:1.19
The push refers to a repository [11.8.36.21:8443/library/nginx-2]
f0f30197ccf9: Pushed 
eeb14ff930d4: Pushed 
c9732df61184: Pushed 
4b8db2d7f35a: Pushed 
431f409d4c5a: Pushed 
02c055ef67f5: Pushed 
1.19: digest: sha256:eba373a0620f68ffdc3f217041ad25ef084475b8feb35b992574cd83698e9e3c size: 1570
```

#### Containerd 配置镜像仓库

Kubernetes 最早将在 1.23 版本弃用 Docker 作为容器运行时，并在博客中强调可以使用如 Containerd 等 CRI 运行时来代替 Docker。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20210806220323.png)

kubelet 直接调用 Containerd 意味着调用链更短，组件更少，更稳定，占用节点资源更少。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20210806220341.png)

对于 Containerd 来说，不能像 Docker 一样使用 docker login 登录到镜像仓库，需要修改其配置文件来进行认证。

##### 方式一 跳过证书验证
编辑 /etc/containerd/config.toml 文件，添加以下配置。注意这里有个天坑：registry.mirrors 后面跟的才是 Harbor 主机的地址，一定要写对，反倒是 endpoint 中的内容可以随便写。
```sh
  [plugins."io.containerd.grpc.v1.cri".registry]
      [plugins."io.containerd.grpc.v1.cri".registry.mirrors]
         [plugins."io.containerd.grpc.v1.cri".registry.mirrors."docker.io"]
            endpoint = ["https://registry-1.docker.io"]
         [plugins."io.containerd.grpc.v1.cri".registry.mirrors."11.8.75.154:11111"] #一定要写对
             endpoint = ["https://11.8.75.154:11111"] #其实可以随便写
      [plugins."io.containerd.grpc.v1.cri".registry.configs]
         [plugins."io.containerd.grpc.v1.cri".registry.configs."11.8.75.154:11111".tls]
             insecure_skip_verify = true #跳过证书验证
         [plugins."io.containerd.grpc.v1.cri".registry.configs."11.8.75.154:11111".auth]
             username = "admin"
             password = "Harbor12345"
```

##### 方式二 配置证书

如果想要安全些，可以把 CA 证书拷贝到 containerd 的机器上，然后修改 /etc/containerd/config.toml，指定 CA 证书。
```sh
  [plugins."io.containerd.grpc.v1.cri".registry]
      [plugins."io.containerd.grpc.v1.cri".registry.mirrors]
         [plugins."io.containerd.grpc.v1.cri".registry.mirrors."docker.io"]
            endpoint = ["https://registry-1.docker.io"]
         [plugins."io.containerd.grpc.v1.cri".registry.mirrors."11.8.75.154:11111"]
             endpoint = ["https://11.8.75.154:11111"]
      [plugins."io.containerd.grpc.v1.cri".registry.configs]
         [plugins."io.containerd.grpc.v1.cri".registry.configs."11.8.75.154:11111".tls]
             ca_file = "/etc/ssl/certs/ca.crt" #指定CA证书
         [plugins."io.containerd.grpc.v1.cri".registry.configs."11.8.75.154:11111".auth]
             username = "admin"
             password = "Harbor12345"
```

配置文件后重启 Containerd：

```sh
systemctl restart containerd
```
当 Kubernetes 需要拉取 Harbor 的镜像时，会自动根据 Containerd 的配置认证 Harbor 镜像仓库。

## Kubernetes 部署 Harbor

上面介绍的通过 Docker Compose 方式部署 Harbor 的方式通常仅在单机测试环境下使用，在生产环境中用户可能需要在 Kubernetes 集群中部署 Harbor。Harbor 提供了 Helm Chart 来帮助用户在 Kubernetes 上快速部署 Harbor。

添加 Harbor Helm Chart 仓库，并将 Helm Chart 下载到本地。
```sh
helm repo add harbor https://helm.goharbor.io
helm pull  harbor/harbor --untar
```
编辑 harbar/values.yaml 文件：
* 修改服务类型为 nodePort，这样 Kubernetes 集群外部的机器就可以通过 Node:IP 来访问 Harbor。
* 设置 HTTPS 证书的域名。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20210807222632.png)

* 修改 externalURL，表示外部客户端访问 Harbor 的地址。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20210809205319.png)

执行下面命令在 cloudnative-lab 命名空间部署 Harbor。
```sh
helm install harbor -n cloudnative-lab harbor --create-namespace
```

查看部署的 Harbor 容器。
```sh
❯ kubectl get pod -n cloudnative-lab | grep harbor
harbor-chartmuseum-685fccc58d-n6bs7              1/1     Running   0          5m46s
harbor-core-58db6ff9b9-zfk2z                     1/1     Running   1          5m46s
harbor-database-0                                1/1     Running   0          5m46s
harbor-jobservice-6867cc6bfb-cpvrq               1/1     Running   0          5m46s
harbor-nginx-7949594686-f4cxz                    1/1     Running   0          5m46s
harbor-notary-server-6845f46559-975g4            1/1     Running   2          5m46s
harbor-notary-signer-6bcf747cc7-9k62c            1/1     Running   2          5m46s
harbor-portal-c55c48545-twnfn                    1/1     Running   0          5m46s
harbor-redis-0                                   1/1     Running   0          5m46s
harbor-registry-7df77757c4-k4kqz                 2/2     Running   0          5m46s
harbor-trivy-0                                   1/1     Running   1          5m46s
```

查看 Harbor 相关的 service，注意名为 harbor 的 service，这是 Harbor 反向代理 Nginx 的容器对应的 service，通过 NodePort 的方式暴露到集群外，下面在 Kubernetes 集群外我们都是通过这个 service 来访问 Harbor。

```sh
❯ kubectl get svc -n cloudnative-lab | grep harbor
harbor                          NodePort    24.3.218.77    <none>        80:30002/TCP,443:30003/TCP,4443:30004/TCP   6m7s
harbor-chartmuseum              ClusterIP   24.3.89.193    <none>        80/TCP                                      6m8s
harbor-core                     ClusterIP   24.3.166.42    <none>        80/TCP                                      6m8s
harbor-database                 ClusterIP   24.3.68.131    <none>        5432/TCP                                    6m8s
harbor-jobservice               ClusterIP   24.3.96.160    <none>        80/TCP                                      6m8s
harbor-notary-server            ClusterIP   24.3.15.36     <none>        4443/TCP                                    6m7s
harbor-notary-signer            ClusterIP   24.3.150.117   <none>        7899/TCP                                    6m7s
harbor-portal                   ClusterIP   24.3.183.66    <none>        80/TCP                                      6m7s
harbor-redis                    ClusterIP   24.3.254.28    <none>        6379/TCP                                    6m7s
harbor-registry                 ClusterIP   24.3.167.212   <none>        5000/TCP,8080/TCP                           6m7s
harbor-trivy                    ClusterIP   24.3.110.121   <none>        8080/TCP                                    6m7s
```

客户端添加 hosts 记录，编辑 /etc/hosts 添加，11.8.38.43 是其中一个 Kubernetes 节点的 IP 地址，myharbor.com 是我们前面部署 Harbor 时指定的域名。

```sh
11.8.38.43   myharbor.com
```

通过 Kubernetes 部署 Harbor 默认会生成自签名证书并启动 HTTPS 加密。浏览器输入 https://myharbor.com:30003 访问 Harbor 用户界面。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20210807195758.png)

## 使用 Harbor 作为 Helm Chart 制品仓库

Harbor 不仅可以作为镜像仓库，还可以管理符合 OCI 规范的 Helm Chart、CNAB、OPA Bundle 等 Artifact。

### WebUI 上传 Helm Charts

首先新建一个项目名为 helm-repo。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20210807200633.png)

从 [Helm Chart 仓库](https://artifacthub.io) 找一个别人分享的 Helm Chart，这里我选择一个 Kafka Helm Chart。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20210807212016.png)

使用以下命令拉取 Kafka Helm Chart。
```sh
helm repo add bitnami https://charts.bitnami.com/bitnami
helm pull bitnami/kafka
```

在 Harbor 界面选择 Kafka Helm Chart 的压缩文件，点击上传。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20210807201459.png)

Helm Charts 上传成功后，就可以看到相关信息，包括: Chart 版本号、状态、作者、模板引擎、创建时间等信息。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20210807201952.png)

点击 Chart 版本可以查看该 Chart 的详细信息主要包括 Summary、Dependencies、Values 等相关信息。
* Summary：Helm Chart 相关介绍以及安装命令等。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20210807202049.png)

* Dependencies：Helm Chart 依赖的其他 repository 信息。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20210807202107.png)

* Values：Helm Chart 的 values.yaml 文件内容。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20210807202118.png)


### 添加 harbor helm 仓库

因为我们的 HTTPS 证书是自签名证书，在添加仓库的时候需要带上 ca.crt，如果是受信任的第三方 CA 签名的证书则无需此步骤。点击注册证书下载 ca.crt 文件。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20210807214514.png)

在 helm repo add 命令时指定 ca.crt 文件。
```sh
helm repo add --ca-file ca.crt \
--username=admin --password=Harbor12345 \
myrepo https://myharbor.com:30003/chartrepo/helm-repo
```

查看刚刚添加的名为 myrepo 的仓库。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20210807205042.png)

### 部署 Helm Charts

```sh
helm install kafka --ca-file=ca.crt \
--username=admin --password=Harbor12345 myrepo/kafka
```

查看部署的 Kafka Helm Chart。
```sh
❯ kubectl get pod -n cloudnative-lab | grep kafka
kafka-0                                          1/1     Running   1          36m
kafka-zookeeper-0                                1/1     Running   0          36m
```
### CLI 上传 Helm Charts

如果我们想通过 CLI 上传 Helm Charts 到 Harbor，需要安装 helm plugin。

```sh
helm plugin install https://github.com/chartmuseum/helm-push
```

上传我们提前在本地准备好的 Redis Helm Charts 到 Harbor 仓库。
```sh
helm push --ca-file=ca.crt --username=admin --password=Harbor12345  redis  myrepo
Pushing redis-12.7.7.tgz to myrepo...
Done.
```

查看刚刚上传好的 Redis Helm Chart。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20210807210707.png)

## 远程复制

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20210810233041.png)

在大规模集群环境下，如果所有 Docker 主机都从一个镜像仓库中拉取镜像，那么此镜像仓库很可能会成为镜像分发的瓶颈，影响镜像分发的速度。可以通过搭建多个镜像仓库并配合使用远程复制功能，解决这一问题。如下图所示，图中的镜像仓库分为两级：主仓库和子仓库。在主仓库和子仓库之间配置了远程复制策略。当一个应用镜像被推送到主仓库后，根据所配置的复制策略，镜像可以立即被分发到其他子镜像仓库。集群中的 Docker 主机就可以就近在其中任意一个子仓库中拉取所需的镜像，减轻主仓库的压力。

首先新建一个目标仓库，这里的目标仓库选择前面用 Docker Compose 部署的 Harbor。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20210807213832.png)

查看创建好的目标仓库。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20210807213848.png)

创建复制规则，复制策略支持推送和拉取两种方式。推送是指将当前 Harbor 实例的 Artifact 复制到远程 Artifact 仓库服务下；拉取是指将其他 Artifact 仓库服务中的 Artifact 复制到当前 Harbor 实例中。

Harbor 针对 Artifact 的不同属性支持 4 种过滤器，分别是名称过滤器、Tag 过滤器、标签过滤器、资源过滤器。

这里我们选择远程复制 library 项目下的所有镜像到 Docker Compose 部署的 Harbor 中。触发模式为事件驱动，一旦有镜像推送到 Harbor 中，就会立即复制到远程仓库中。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20210807214004.png)

查看复制策略。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20210807214220.png)

我们找一台 Docker 客户端上传镜像到 myharbor.com 这个 Harbor，需要在 /etc/docker/certs.d 目录下创建 Harbor地址:端口号的目录，并将 Harbor 的 CA 证书放在里面。
```sh
#创建目录
mkdir /etc/docker/certs.d/myharbor.com:30003

#Harbor CA 证书，和前面在使用 Harbor 作为 Helm Chart 制品仓库章节中下载的一样
> ls /etc/docker/certs.d/myharbor.com:30003
ca.crt
```

给本地的 Docker 镜像打上 Harbor 仓库的 tag。
```sh
docker tag 11.8.36.21:8888/library/nginx:1.19 myharbor.com:30003/library/nginx-new:1.19
```

推送镜像到 Harbor。
```sh
docker push myharbor.com:30003/library/nginx-new:1.19
```

在 myharbor.com 的 Harbor 仓库查看刚刚推送上来的镜像。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20210809203701.png)

查看复制进度，可以看到已经完成了复制。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20210809203725.png)

到远程仓库查看，可以看到镜像已经成功复制过来了。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20210809203808.png)

## 镜像扫描

代码和软件通常具有缺陷，作为应用和其所依赖的软件包和操作系统的打包形式，容器镜像自然也不例外。恶意的攻击者会利用其中的一些缺陷非法入侵系统，破坏系统的运行或者窃取私密信息，这些缺陷就是我们熟知的漏洞。缺陷一旦被认定为漏洞，就可以通过 MITRE 公司注册为 CVE（Common Vulnerabilities and Exposures，公开披露的计算机安全漏洞列表）。

Harbor 支持 Trivy 和 Clair 作为镜像扫描器，通过 Helm 方式部署的 Harbor 默认安装了 Trivy。

可以在项目中选择指定的 Artifact 进行扫描，也可以在审查服务中进行全局漏洞扫描。

全局漏洞扫描：
![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20210810234736.png)

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20210809214937.png)


选择指定 Artifact 扫描：
![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20210810235556.png)

扫描完成后可以看到镜像危急、严重、中等、较低、可忽略、未知不同等级的漏洞数量。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20210809215103.png)

点击镜像可以查看漏洞的详细信息。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20210809215019.png)

点击 CVE 缺项码可以跳转到 Aqua Security 网站上查看该 CVE 缺陷码的详细说明。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20210809215044.png)

## 镜像签名

TUF 是一种安全软件分发规范，具有由非对称密钥表示的具有层次结构的角色，并且运用这些非对称密钥签名的元数据来建立信任。开源项目 Notary 基于 TUF 实现，提供了完整的工具链来更好地支持内容信任流程。

通过 Helm 方式部署 Harbor 默认安装了 Notary。在 Harbor 内核服务中实现了签名管理器，可通过 Notary 服务器实现 Artifact 数字签名的管理。内容信任确保客户端或者容器运行时拉取的 Artifact 内容真实可靠，从而更好地提高系统的安全性。

新建一个项目 sign 存放该实验的镜像。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20210809211038.png)

启用内容信任策略。当 Harbor 启用内容信任策略后，如果 Harbor 收到客户端拉取 Artifact 的请求，Core 组件中的内容信任策略中间件处理器就会根据所请求的 Artifact 的签名信息，决定该请求是否被允许。如果签名信息不存在，则拉取请求会被拒绝；如果签名信息存在且合法，则拉取请求会被允许通过。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20210809211111.png)

在 Docker 客户端的命令行中设置以下环境变量启用内容信任机制。
```sh
export DOCKER_CONTENT_TRUST=1
export DOCKER_CONTENT_TRUST_SERVER=https://myharbor.com:30004
```

我在安装 Harbor 时启用了 TLS 并且使用了自签证书，需要确保复制 CA 证书到 Docker 客户端以下两个目录中。
```sh
#30004 是 Notary 服务对外暴露的端口
~/.docker/tls/myharbor.com:30004
#30003 是 Portal 服务对外暴露的端口
/etc/docker/certs.d/myharbor.com:30003
```

在本地给镜像打 tag 并推送镜像到 Harbor。在上传成功后会继续内容信任的签名步骤。如果根密钥还未创建，则系统会要求输入强密码以创建根密钥，之后在启用内容信任的条件下推送镜像都需要该密码。同时，系统还会要求输入强密码以创建正在推送的镜像仓库的目标密钥。
```sh
> docker tag 11.8.36.21:8443/library/nginx:1.19 myharbor.com:30003/sign/nginx-sign:1.19
> docker push myharbor.com:30003/sign/nginx-sign:1.19
The push refers to a repository [myharbor.com:30003/sign/nginx-sign]
f0f30197ccf9: Layer already exists 
eeb14ff930d4: Layer already exists 
c9732df61184: Layer already exists 
4b8db2d7f35a: Layer already exists 
431f409d4c5a: Layer already exists 
02c055ef67f5: Layer already exists 
1.19: digest: sha256:eba373a0620f68ffdc3f217041ad25ef084475b8feb35b992574cd83698e9e3c size: 1570
Signing and pushing trust metadata
#创建根密钥
You are about to create a new root signing key passphrase. This passphrase
will be used to protect the most sensitive key in your signing system. Please
choose a long, complex passphrase and be careful to keep the password and the
key file itself secure and backed up. It is highly recommended that you use a
password manager to generate the passphrase and keep it safe. There will be no
way to recover this key. You can find the key in your config directory.
Enter passphrase for new root key with ID 00eeb53: 
Repeat passphrase for new root key with ID 00eeb53: 
#创建正在推送的镜像仓库的目标密钥
Enter passphrase for new repository key with ID 45f6c55 (myharbor.com:30003/sign/nginx-sign): 
Repeat passphrase for new repository key with ID 45f6c55 (myharbor.com:30003/sign/nginx-sign): 
Finished initializing "myharbor.com:30003/sign/nginx-sign"
Successfully signed "myharbor.com:30003/sign/nginx-sign":1.19
```

生成的密钥都会以 `~/.docker/trust/private/<digest>.key` 路径存放，对应的 TUF 元数据文件被存放在 `~/.docker/trust/tuf/<harbor 主机地址:端口号>/<镜像仓库路径>/metadata` 目录下。
```sh
#tree ~/.docker/trust/
/root/.docker/trust/
├── private
│   ├── root_keys
│   │   └── 00eeb53b454983f95c12718d1dcfdbc1e600253c20eab1ca8ee5743dac9f0fa0.key
│   └── tuf_keys
│       └── myharbor.com:30003
│           └── sign
│               └── nginx-sign
│                   └── 45f6c55ea9846cf0ba552915e0599b4e7f45c742f6418c5f1116b61f2650ca48.key
└── tuf
    └── myharbor.com:30003
        └── sign
            └── nginx-sign
                ├── changelist
                └── metadata
                    ├── root.json
```

签名成功后，登录 Harbor 管理界面，可以在镜像的 tag 列表中查看该镜像处于已签名的状态。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20210809212525.png)

此时我们推送一个没有签名的镜像到 Harbor 中，在上传完镜像后我们不做签名的操作。
```sh
docker tag 11.8.36.21:8443/library/nginx:1.19 myharbor.com:30003/sign/nginx-unsign:1.19
docker push myharbor.com:30003/sign/nginx-unsign:1.19
```

查看该未签名的镜像。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20210809213035.png)

未签名的镜像是无法拉取的，如果尝试拉取会有以下报错。
```sh
#docker pull myharbor.com:30003/sign/nginx-unsign:1.19
Error: remote trust data does not exist for myharbor.com:30003/sign/nginx-unsign: myharbor.com:30004 does not have trust data for myharbor.com:30003/sign/nginx-unsign
```

签名了的镜像无法直接通过 Harbor 进行删除。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20210809213310.png)

如果想要删除该镜像，需要先通过 Notary 去掉镜像签名然后才可以删除。使用以下命令安装 Notary 客户端。
```sh
wget https://github.com/theupdateframework/notary/releases/download/v0.6.1/notary-Linux-amd64
mv notary-Linux-amd64 /usr/local/bin/notary
chmod +x /usr/local/bin/notary 
```

去掉镜像的签名，注意后面 tag 和镜像名是用空格隔开的。
```sh
notary -s https://myharbor.com:30004 \
-d ~/.docker/trust/ --tlscacert ~/.docker/tls/myharbor.com:30004/ca.crt \
remove -p myharbor.com:30003/sign/nginx-sign 1.19
```

查看镜像发现已经变成未签名的状态了。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20210809214315.png)

此时就可以删除镜像了。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20210809214453.png)

## 垃圾清理

在 Harbor 的日常使用过程中，对资源的使用会随着 Artifact 的增加而增加。由于资源有限，所以在删除 Artifact 后需要将其所占用的存储空间释放。当用户在 Harbor 中删除 Artifact 时是 “软删除”，即仅删除 Artifact 对应的数据记录，并不删除存储。垃圾回收的本质是对存储资源的自动管理，即回收 Harbor 中不再被使用的 Artifact 所占用的存储空间。

手动删除：

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20210809222629.png)

设置定时删除任务：

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20210809222735.png)

## 一个小坑

通过 Docker 客户端登录 Harbor 时遇到证书过期的报错，搞了一晚上一直无法登录成功，结果第二天的时候莫名奇妙又可以成功登陆 Harbor 了。
```sh
#docker login https://myharbor.com:30003
Username: admin
Password: 
Error response from daemon: Get https://myharbor.com:30003/v1/users/: x509: certificate has expired or is not yet valid
```

于是想到有可能是时间的问题，可能是 Docker 客户端的时间比证书生效的时间还早。查看了系统时间果然发现时间比标准时间慢了 6 分钟。设置 NTP 同步时间以后就可以正常登录了。
```sh
#date 
Mon Aug  9 20:54:43 CST 2021
root@ydt-net-nginx-cisp:/etc/docker/certs.d/myharbor.com:30003 #

#ntpdate ntp3.aliyun.com
 9 Aug 21:00:47 ntpdate[96996]: step time server 203.107.6.88 offset 355.206298 sec
root@ydt-net-nginx-cisp:/etc/docker/certs.d/

#date 
Mon Aug  9 21:00:51 CST 2021

#docker login https://myharbor.com:30003
Username: admin
Password: 
Login Succeeded
```

## 参考资料
* Harbor 权威指南
* https://blog.csdn.net/weixin_34387468/article/details/91855502
* https://zhuanlan.zhihu.com/p/336866221
* https://fuckcloudnative.io/posts/install-harbor-on-kubernetes/
* https://goharbor.io/docs/1.10/install-config/configure-https/
* https://www.bladewan.com/2020/02/22/harbor_notary/
