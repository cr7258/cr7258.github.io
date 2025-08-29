---
title: Docker 常用命令
author: Se7en
date: 2024/12/32 19:00
categories:
 - 个人速查手册
tags:
 - Docker
---

# Docker 常用命令

## 列出指定条件的容器

可以使用 `--filter` 参数来筛选满足指定条件的容器，参考文档：[docker container ls](https://docs.docker.com/reference/cli/docker/container/ls/#filter)，常见的参数如下：

- name：容器名称
- ancestor：镜像名称
- label：标签
- status：容器状态

以下命令列出了所有镜像是 `fluent/fluentd:edge-debian` 的容器。

```bash
docker ps -a --filter ancestor=fluent/fluentd:edge-debian
CONTAINER ID   IMAGE                        COMMAND                  CREATED        STATUS                    PORTS     NAMES
8bb44579fbc1   fluent/fluentd:edge-debian   "tini -- /bin/entryp…"   4 months ago   Exited (0) 4 months ago             crazy_raman
10385990750b   fluent/fluentd:edge-debian   "tini -- /bin/entryp…"   4 months ago   Exited (0) 4 months ago             dreamy_bell
493fcea42f53   fluent/fluentd:edge-debian   "tini -- /bin/entryp…"   4 months ago   Exited (0) 4 months ago             flamboyant_roentgen
c68932dfd813   fluent/fluentd:edge-debian   "tini -- /bin/entryp…"   4 months ago   Exited (1) 4 months ago             hopeful_carson
a174647e9e5a   fluent/fluentd:edge-debian   "tini -- /bin/entryp…"   4 months ago   Exited (1) 4 months ago             eager_goldstine
3401e866295f   fluent/fluentd:edge-debian   "tini -- /bin/entryp…"   4 months ago   Exited (1) 4 months ago             hopeful_wozniak
a4bfc39b1f43   fluent/fluentd:edge-debian   "tini -- /bin/entryp…"   4 months ago   Exited (0) 4 months ago             frosty_margulis
fc4282a232dd   fluent/fluentd:edge-debian   "tini -- /bin/entryp…"   4 months ago   Exited (0) 4 months ago             cool_shannon
```

## 批量删除容器

可以先[列出指定条件的容器](#列出指定条件的容器)，然后使用 `docker rm` 命令进行批量删除。`-q` 参数会只输出容器 id，这样就无需处理其他字段和表头了。


```bash
docker rm $(docker ps -aq --filter ancestor=fluent/fluentd:edge-debian)
```

## 查看镜像信息

使用 `docker manifest inspect` 命令可以查看远程镜像（包括多架构镜像清单）的详细信息，例如支持的操作系统和硬件架构平台。

```json
docker manifest inspect ghcr.io/tektoncd/pipeline/controller-10a3e32792f33651396d02b6855a6e36:v1.3.0@sha256:702fca76e77ef1dc991d72b41fe7af4be00f0e0c84160060a7bdf11cd6a3429f
{
   "schemaVersion": 2,
   "mediaType": "application/vnd.oci.image.index.v1+json",
   "manifests": [
      {
         "mediaType": "application/vnd.oci.image.manifest.v1+json",
         "size": 1281,
         "digest": "sha256:6a700983edecf6e7c4aba4e7b8109fc444c268505bc9fe8c9f39dbcfa68a0cba",
         "platform": {
            "architecture": "amd64",
            "os": "linux"
         }
      },
      {
         "mediaType": "application/vnd.oci.image.manifest.v1+json",
         "size": 1281,
         "digest": "sha256:a8874d89deffbfbf217c387fc22620f7e52235ae1a6f6db629f1b41acb62442b",
         "platform": {
            "architecture": "arm64",
            "os": "linux"
         }
      },
      {
         "mediaType": "application/vnd.oci.image.manifest.v1+json",
         "size": 1281,
         "digest": "sha256:4c082d1c143618458d832434570041a5eabc78539f3309937655920018f8a4f7",
         "platform": {
            "architecture": "ppc64le",
            "os": "linux"
         }
      },
      {
         "mediaType": "application/vnd.oci.image.manifest.v1+json",
         "size": 1281,
         "digest": "sha256:34273635adbc2a8fc1bec39dcace59daabdc8d07f8b1ebb7b0ddb17367a473fc",
         "platform": {
            "architecture": "s390x",
            "os": "linux"
         }
      }
   ]
}
```

`docker inspect` 命令可以查看本地已下载镜像或容器的详细元数据和配置信息，包括镜像的实际架构、环境变量、挂载点等.

```json
docker inspect tektoncd-pipeline-controller:v1.3.0
[
    {
        "Id": "sha256:172c3967df32e2c0275b7c591987258524fabb0ccffe0343a163dd3fdc6be0f9",
        "RepoTags": [
            "tektoncd-pipeline-controller:v1.3.0",
            "registry.cn-shanghai.aliyuncs.com/cr7258/tektoncd-pipeline-controller:v1.3.0"
        ],
        "RepoDigests": [
            "ghcr.io/tektoncd/pipeline/controller-10a3e32792f33651396d02b6855a6e36@sha256:702fca76e77ef1dc991d72b41fe7af4be00f0e0c84160060a7bdf11cd6a3429f",
            "registry.cn-shanghai.aliyuncs.com/cr7258/tektoncd-pipeline-controller@sha256:5a2ae01f6c7f96598bc393f8e22129f2754fcb463864feae797662e97e4e0ae4"
        ],
        "Parent": "",
        "Comment": "go build output, at /ko-app/controller",
        "Created": "2023-06-05T10:34:41Z",
        "DockerVersion": "",
        "Author": "github.com/ko-build/ko",
        "Architecture": "arm64",
        "Os": "linux",
        "Size": 124817518,
        "GraphDriver": {
            "Data": {
                "LowerDir": "/var/lib/docker/overlay2/22b7721c8319399fa1db18ab9330ccbacbdf3fa1bb3fbddd6e90f0e1276214ea/diff:/var/lib/docker/overlay2/68d96e60dc8b19d9646485bd3f425252d7b6ff9dd8b7ad87fb92acc0c8e56ab1/diff",
                "MergedDir": "/var/lib/docker/overlay2/9e4782705a9ebec4cb29c7e267a6c0ef9ff3ef7f90dac3ac3280830257b98700/merged",
                "UpperDir": "/var/lib/docker/overlay2/9e4782705a9ebec4cb29c7e267a6c0ef9ff3ef7f90dac3ac3280830257b98700/diff",
                "WorkDir": "/var/lib/docker/overlay2/9e4782705a9ebec4cb29c7e267a6c0ef9ff3ef7f90dac3ac3280830257b98700/work"
            },
            "Name": "overlay2"
        },
        "RootFS": {
            "Type": "layers",
            "Layers": [
                "sha256:143661a4b30cc84bc541c9211c80270726dce23029e70c285e68bc94be7364e2",
                "sha256:e5574a8030beedeed1e7e94c352ee16b90354e3d5d26d24fae11298651777c8a",
                "sha256:c9aa02049f3fa66e0ac51c4106164b844c77c1f57f6c0c92f4ef5e34777ad9c5"
            ]
        },
        "Metadata": {
            "LastTagTime": "2025-08-28T17:46:37.945305188+08:00"
        },
        "Config": {
            "Cmd": null,
            "Entrypoint": [
                "/ko-app/controller"
            ],
            "Env": [
                "PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/ko-app",
                "SSL_CERT_FILE=/etc/ssl/certs/ca-certificates.crt",
                "KO_DATA_PATH=/var/run/ko"
            ],
            "Labels": {
                "org.opencontainers.image.source": "https://github.com/tektoncd/pipeline"
            },
            "OnBuild": null,
            "User": "65532",
            "Volumes": null,
            "WorkingDir": ""
        }
    }
]
```