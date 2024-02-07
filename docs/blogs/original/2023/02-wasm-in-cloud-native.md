---
title: WebAssembly 在云原生中的实践指南
author: Se7en
date: 2023/10/07 22:36
categories:
 - 原创
tags:
 - WebAssembly
---

# WebAssembly 在云原生中的实践指南

## 1 WebAssembly 介绍

WebAssembly（Wasm）是一种通用字节码技术，它可以将其他编程语言（如 Go、Rust、C/C++ 等）的程序代码编译为可在浏览器环境直接执行的字节码程序。

WebAssembly 的初衷之一是解决 JavaScript 的性能问题，让 Web 应用程序能够达到与本地原生应用程序类似的性能。作为底层 VM 的通用、开放、高效的抽象，许多编程语言，例如C、C++ 和 Rust，都可以将现有应用程序编译成 Wasm 的目标代码，以便它们在浏览器中运行。这将应用程序开发技术与运行时技术解耦，并大大提高了代码的可重用性。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20230820174652.png)

2019 年 3 月，Mozilla 推出了 WebAssembly 系统接口（Wasi），以标准化 WebAssembly 应用程序与系统资源之间的交互抽象，例如文件系统访问、内存管理和网络连接，该接口类似于 POSIX 等标准 API。**Wasi 规范的出现极大地扩展了 WebAssembly 的应用场景，使得 Wasm 不仅限于在浏览器中运行，而且可以在服务器端得到应用**。同时，平台开发者可以针对特定的操作系统和运行环境提供 Wasi 接口的不同实现，允许跨平台的 WebAssembly 应用程序运行在不同的设备和操作系统上。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20230820174720.png)

## 2 WebAssembly 会取代容器吗？

Docker 的创始人 Solomon Hykes 是这样评价 WASI 的：
> 如果 WASM+WASI 在 2008 年就存在，我们就不需要创建 Docker 了。这就是它的重要性。服务器上的 WebAssembly 是计算的未来。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20230820173347.png)

Solomon Hykes 后续还发布了一条推文，表示  WebAssembly 将与容器一起工作，而不是取代它们。WebAssembly 可以成为一种容器类型，类似于 Linux 容器或 Windows 容器。它将成为标准的跨平台应用程序分发和运行时环境。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20230820175428.png)

## 3 WebAssembly 的优势

WebAssembly 相较于传统的容器有着许多显著的优势：

- **体积更小**：WebAssembly 应用程序比容器小，以下是两个简单的用于输出文档的应用程序，都是使用标准工具构建的，从下图可以看出，Wasm 应用程序比容器化应用程序小了近 10 倍。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20230820175224.png)

- **速度更快**：WebAssembly 应用程序的启动速度可以比容器快 1000 倍，你可以在不到一毫秒的时间内执行应用程序的第一条指令，有时甚至可以达到微秒级。这将使构建可伸缩的应用程序变得更加容易，当请求达到峰值时，应用程序可以快速伸缩，当请求下降到零且没有流量时，应用程序不会浪费 CPU 或内存。
- **更加安全**：WebAssembly 在沙箱环境中运行，具有强大的安全性。它提供了一系列安全特性，如内存隔离、类型检查和资源限制，以防止恶意代码执行和访问敏感信息。
- **可移植性更好**：容器的架构限制了它们的可移植性。例如，针对 linux/amd64 构建的容器无法在 linux/arm64 上运行，也无法在 windows/amd64 或 windows/arm64 上运行。这意味着组织需要为同一个应用程序创建和维护多个镜像，以适应不同的操作系统和 CPU 架构。而 WebAssembly 通过创建一个在可以任何地方运行的单一 Wasm 模块来解决这个问题。只需构建一次 wasm32/wasi 的应用程序，任何主机上的 Wasm 运行时都可以执行它。这意味着 WebAssembly 实现了一次构建，到处运行的承诺，不再需要为不同的操作系统和 CPU 架构构建和维护多个镜像。

关于 WebAssembly 和容器详细的对比，可以查看这个表格: [WebAssembly vs Linux Container [1]](https://wasmedge.org/wasm_linux_container/)。

## 4 使用 Rust 开发 Wasm 应用

是否可以将应用程序编译为 Wasm 在很大程度上取决于所使用的编程语言。Rust、C、C++ 等语言对 Wasm 有很好的支持。从 Go 1.21 版本开始，Go 官方也初步支持了 Wasi，之前需要使用第三方工具如 tinygo 进行编译。由于 Rust 对 Wasm 的一流支持以及无需 GC、零运行时开销的特点，使其成为了开发 Wasm 应用的理想选择。因此，本文选用 Rust 来开发 Wasm 应用程序。

### 4.1 安装 Rust

执行以下命令安装 rustup，并通过 rustup 安装 Rust 的最新稳定版本，rustup 是用于管理 Rust 版本和工具链的命令行工具。

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```
### 4.2 为 Rust 添加 wasm32-wasi  编译目标

前面提到过，Wasi（WebAssembly System Interface）是用于 WebAssembly 的系统级接口，旨在实现 WebAssembly 在不同环境中与宿主系统交互。它提供标准化的方式，使得 WebAssembly 可以进行文件 I/O、网络操作和系统调用等系统级功能访问。

rustc 本身是一个跨平台的编译器，其编译的目标有很多，具体可以通过 `rustup target list` 命令来查看。wasm32-wasi 是 Rust 的编译目标之一，用于将 Rust 代码编译为符合 Wasi 标准的 Wasm 模块。通过将 Rust 代码编译为 wasm32-wasi 目标，可以将 Rust 的功能和安全性引入到 WebAssembly 环境中，同时利用 wasm32-wasi 提供的标准化系统接口实现与宿主系统的交互。

执行以下命令，为 Rust 编译器添加 wasm32-wasi 目标。

```bash
rustup target add wasm32-wasi
```

### 4.3 编写 Rust 程序

首先执行以下命令构建一个新的 Rust 项目。

```bash
cargo new http-server
```

编辑 Cargo.toml 添加如下依赖。这里我们使用 wrap_wasi 来开发一个简单的 HTTP Server，
warp_wasi 构建在 Warp 框架之上，Warp 是一个轻量级的 Web 服务器框架，用于构建高性能的异步 Web 应用程序。

原生的 Warp 框架编写的代码无法直接编译成 Wasm 模块。因此我们可以使用 warp_wasi，通过它我们可以在 Rust 中利用 Wasi 接口来开发 Web 应用程序。

```bash
[dependencies]
tokio_wasi = { version = "1", features = ["rt", "macros", "net", "time", "io-util"]}
warp_wasi = "0.3"
```

编写一个简单的 HTTP Server，在 8080 端口暴露服务，当接收到请求时返回 Hello, World!。

```rust
use warp::Filter;

#[tokio::main(flavor = "current_thread")]
async fn main() {
    let hello = warp::get()
        .and(warp::path::end())
        .map(|| "Hello, World!");

    warp::serve(hello).run(([0, 0, 0, 0], 8080)).await;
}
```

执行以下命令，将程序编译为 Wasm 模块。

```bash
cargo build --target wasm32-wasi --release
```

### 4.4 安装 WasmEdge

编译完成的 Wasm 模块需要使用相应的 Wasm 运行时来运行。常见的 Wasm 运行时包括 WasmEdge、Wasmtime 和 Wasmer 等。

在这里，我们选择使用 WasmEdge，它是一个轻量、高性能且可扩展的 WebAssembly Runtime。执行以下命令安装 WasmEdge。

```bash
curl -sSf https://raw.githubusercontent.com/WasmEdge/WasmEdge/master/utils/install.sh | bash
```

运行以下命令以使已安装的二进制文件在当前会话中可用。

```bash
source $HOME/.wasmedge/env
```

### 4.5 运行 Wasm 模块

使用 wasmedge 来运行前面编译好的 Wasm 模块。

```bash
wasmedge target/wasm32-wasi/release/http-server.wasm
```

在本地通过 curl 命令访问该服务。

```bash
curl http://localhost:8080
Hello, World!
```

## 5 运行 Wasm 工作负载

### 5.1 在 Linux 容器中运行 Wasm 工作负载

在容器生态系统中运行 Wasm 应用程序最简单的方法就是将 Wasm 模块直接嵌入到 Linux 容器镜像中。具体来说，我们可以将容器内的 Linux 操作系统精简到足够支持 Wasmedge 运行时，然后通过 Wasmedge 来运行 Wasm 模块。由于 Wasm 应用程序包装在常规容器中，因此它可以与任何容器生态系统无缝地协作。通过这种方式，整个 Linux 操作系统和 Wasmedge 运行时的内存占用可以减少到仅为 4MB。

相较于常规的 Linux 操作系统，精简版的 Linux 操作系统大大减少了攻击面。然而，这种方法仍然需要启动 Linux 容器。即使是精简版的 Linux 操作系统，在镜像大小上仍然占据了整个容器大小的 80%，因此仍然有很大的优化空间。

接下来根据前面编写的 Rust 代码构建出 Linux 容器镜像。首先在前面创建的 http-server 项目根目录下创建一个名为 Dockerfile-wasmedge-slim 的  Dockerfile，将编译完成的 Wasm 模块添加到安装了 wasmedge 的精简 linux 镜像中，并指定通过 wasmedge 命令来启动 Wasm 模块。

```yaml
FROM wasmedge/slim-runtime:0.10.1
COPY target/wasm32-wasi/release/http-server.wasm /
CMD ["wasmedge", "--dir", ".:/", "/http-server.wasm"]
```

执行以下命令构建容器镜像。

```bash
docker build -f Dockerfile-wasmedge-slim -t cr7258/wasm-demo-app:slim .
```

启动容器。

```bash
docker run -itd -p 8080:8080 \
--name wasm-demo-app \
docker.io/cr7258/wasm-demo-app:slim
```

在本地通过 curl 命令访问该服务。

```bash
curl http://localhost:8080
Hello, World!
```

### 5.2 在支持 Wasm 的容器运行时中运行 Wasm 工作负载

前面我们介绍了如何将 Wasm 模块直接嵌入到 Linux 容器中来运行 Wasm 工作负载，这种方式的好处就是可以无缝地与现有的环境进行集成，同时享受到 Wasm 带来的性能的提升。

然而这种方法的性能和安全性不如直接在支持 Wasm 的容器运行时中运行 Wasm 程序那么好。一般我们将容器运行时分为高级运行时和低级运行时：
- **低级容器运行时 (Low level Container Runtime)**：一般指按照 OCI 规范实现的、能够接收可运行文件系统（rootfs） 和 配置文件（config.json）并运行隔离进程的实现。低级容器运行时负责直接管理和运行容器。常见的低级容器运行时有：runc, crun, youki, gvisor, kata 等等。
- **高级容器运行时 (High level Container Runtime)**：负责容器镜像的传输和管理，将镜像转换为 rootfs 和 config.json，并将其传递给低级运行时执行。高级容器运行时是对低级容器运行时的抽象和封装，为用户提供了更简单、易用的容器管理接口，隐藏了低级容器运行时的复杂性。用户可以使用同一种高级容器运行时来管理不同的低级容器运行时。常见的高级容器运行时有：containerd, cri-o 等等。

以下是一个概念图，可以帮助你了解高级和低级运行时是如何协同工作的。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20230830095051.png)

接下来将会分别介绍如何通过高级和低级容器运行时来运行 Wasm 模块，首先构建一个 Wasm 镜像。
#### 5.2.1 构建镜像

在前面创建的 http-server 项目根目录下创建一个 Dockerfile 文件，这次我们直接使用 scratch 空镜像来构建，scratch 是 Docker 中预留的最小的基础镜像。

```bash
FROM scratch
COPY target/wasm32-wasi/release/http-server.wasm /
CMD ["/http-server.wasm"]
```

执行以下命令构建容器镜像。

```bash
docker build -t docker.io/cr7258/wasm-demo-app:v1 .
```

将镜像推送到 Docker Hub 上，方便后续的实验使用。

```bash
# 登录 Docker Hub
docker login
# 推送镜像
docker push docker.io/cr7258/wasm-demo-app:v1
```

在 Docker Hub 上可以看到这次构建的镜像仅有 989.89 KB（压缩后），大小仅有前面构建的 wasm-demo-app:slim 镜像的 1/4。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20230827181837.png)


#### 5.2.2 低级容器运行时

在 5.2.2 章节中将会介绍使用 crun 和 youki 这两种低级容器运行时在不依赖高级容器运行时的情况下，使用准备好的 config.json 和 rootfs 文件来直接启动 Wasm 应用。
##### 5.2.2.1 Crun

crun 是用 C 编写的快速轻量的 OCI 容器运行时，并且内置了对 WasmEdge 的支持。本小节将演示如何通过 crun 来运行 Wasm 模块。

**请确保按照 4.4 小节安装好了 WasmEdge。**

然后在 Ubuntu 系统上从源代码来构建它，执行以下命令安装编译所需的依赖。

```shell
apt update
apt install -y make git gcc build-essential pkgconf libtool \
     libsystemd-dev libprotobuf-c-dev libcap-dev libseccomp-dev libyajl-dev \
     go-md2man libtool autoconf python3 automake
```

接下来，配置、构建和安装支持 WasmEdge 的 crun 二进制文件。

```shell
git clone https://github.com/containers/crun
cd crun
./autogen.sh
./configure --with-wasmedge
make
make install
```

接下来，运行 crun -v 检查是否安装成功。看到有 +WASM:wasmedge，说明已经在 crun 中安装了 WasmEdge 了。

```bash
crun -v

# 返回结果
crun version 1.8.5.0.0.0.23-3856
commit: 385654125154075544e83a6227557bfa5b1f8cc5
rundir: /run/crun
spec: 1.0.0
+SYSTEMD +SELINUX +APPARMOR +CAP +SECCOMP +EBPF +WASM:wasmedge +YAJL
```

创建一个目录来存放运行容器所需的文件。

```bash
mkdir test-crun
cd test-crun
mkdir rootfs
# 将编译好的 Wasm 模块拷贝到 rootfs 目录中，注意替换成自己对应的目录
cp ~/hands-on-lab/wasm/runtime/http-server/target/wasm32-wasi/release/http-server.wasm rootfs
```

使用 `crun spec` 命令生成默认的 config.json 配置文件，然后进行修改：
- 1.在 args 中将 `sh` 替换为 `/http-server.wasm`。
- 2.在 annotations 中添加 `"module.wasm.image/variant": "compat"`，表明表明这是一个没有 guest OS 的 WebAssembly 应用程序。
- 3.在 network namespace 中添加 `"path": "/proc/1/ns/net"`，让程序与宿主机共享网络 namespace，方便在本机进行访问。

修改完成后的配置文件如下：

```json
{
	"ociVersion": "1.0.0",
	"process": {
		"terminal": true,
		"user": {
			"uid": 0,
			"gid": 0
		},
		"args": [
			"/http-server.wasm"
		],
		"env": [
			"PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
			"TERM=xterm"
		],
		"cwd": "/",
		"capabilities": {
			"bounding": [
				"CAP_AUDIT_WRITE",
				"CAP_KILL",
				"CAP_NET_BIND_SERVICE"
			],
			"effective": [
				"CAP_AUDIT_WRITE",
				"CAP_KILL",
				"CAP_NET_BIND_SERVICE"
			],
			"inheritable": [
			],
			"permitted": [
				"CAP_AUDIT_WRITE",
				"CAP_KILL",
				"CAP_NET_BIND_SERVICE"
			],
			"ambient": [
				"CAP_AUDIT_WRITE",
				"CAP_KILL",
				"CAP_NET_BIND_SERVICE"
			]
		},
		"rlimits": [
			{
				"type": "RLIMIT_NOFILE",
				"hard": 1024,
				"soft": 1024
			}
		],
		"noNewPrivileges": true
	},
	"root": {
		"path": "rootfs",
		"readonly": true
	},
	"hostname": "crun",
	"mounts": [
		{
			"destination": "/proc",
			"type": "proc",
			"source": "proc"
		},
		{
			"destination": "/dev",
			"type": "tmpfs",
			"source": "tmpfs",
			"options": [
				"nosuid",
				"strictatime",
				"mode=755",
				"size=65536k"
			]
		},
		{
			"destination": "/dev/pts",
			"type": "devpts",
			"source": "devpts",
			"options": [
				"nosuid",
				"noexec",
				"newinstance",
				"ptmxmode=0666",
				"mode=0620",
				"gid=5"
			]
		},
		{
			"destination": "/dev/shm",
			"type": "tmpfs",
			"source": "shm",
			"options": [
				"nosuid",
				"noexec",
				"nodev",
				"mode=1777",
				"size=65536k"
			]
		},
		{
			"destination": "/dev/mqueue",
			"type": "mqueue",
			"source": "mqueue",
			"options": [
				"nosuid",
				"noexec",
				"nodev"
			]
		},
		{
			"destination": "/sys",
			"type": "sysfs",
			"source": "sysfs",
			"options": [
				"nosuid",
				"noexec",
				"nodev",
				"ro"
			]
		},
		{
			"destination": "/sys/fs/cgroup",
			"type": "cgroup",
			"source": "cgroup",
			"options": [
				"nosuid",
				"noexec",
				"nodev",
				"relatime",
				"ro"
			]
		}
	],
	"annotations": {
		"module.wasm.image/variant": "compat"
	},
	"linux": {
		"resources": {
			"devices": [
				{
					"allow": false,
					"access": "rwm"
				}
			]
		},
		"namespaces": [
			{
				"type": "pid"
			},
			{
				"type": "network",
				"path": "/proc/1/ns/net"
			},
			{
				"type": "ipc"
			},
			{
				"type": "uts"
			},
			{
				"type": "cgroup"
			},
			{
				"type": "mount"
			}
		],
		"maskedPaths": [
			"/proc/acpi",
			"/proc/asound",
			"/proc/kcore",
			"/proc/keys",
			"/proc/latency_stats",
			"/proc/timer_list",
			"/proc/timer_stats",
			"/proc/sched_debug",
			"/sys/firmware",
			"/proc/scsi"
		],
		"readonlyPaths": [
			"/proc/bus",
			"/proc/fs",
			"/proc/irq",
			"/proc/sys",
			"/proc/sysrq-trigger"
		]
	}
}
```


通过 crun 启动容器。

```shell
crun run wasm-demo-app
```

在本地通过 curl 命令访问该服务。

```bash
curl http://localhost:8080
Hello, World!
```

如果想要停止并删除容器，可以执行以下命令。

```bash
crun kill wasm-demo-app SIGKILL
```

##### 5.2.2.2 Youki

youki 是一个使用 Rust 编写的符合 OCI 规范的容器运行时。相较于 C，Rust 的使用带来了内存安全的优势。和 crun 一样，Youki 同样支持了 WasmEdge。

**请确保按照 4.1 小节安装好了 Rust。**

然后 Ubuntu 系统上从源代码来构建它，执行以下命令安装编译所需的依赖。

```bash
apt-get update
sudo apt-get -y install    \
      pkg-config          \
      libsystemd-dev      \
      libdbus-glib-1-dev  \
      build-essential     \
      libelf-dev          \
      libseccomp-dev      \
      libclang-dev        \
      libssl-dev
```

执行以下命令编译支持 WasmEdge 的 youki 二进制文件。

```bash
./scripts/build.sh -o . -r -f wasm-wasmedge
```

指定 wasm-wasmedge 参数将在 `$HOME/.wasmedge` 目录中安装 WasmEdge 运行时库。要使该库在系统中可用，请运行以下命令：

```bash
export LD_LIBRARY_PATH=$HOME/.wasmedge/lib
```

或者：

```bash
source $HOME/.wasmedge/env
```

最后将编译完成后的 youki 文件移动到任意 $PATH 所包含的目录。

```bash
mv youki /usr/local/bin
```

创建一个目录来存放运行容器所需的文件。

```bash
mkdir test-youki
cd test-youki
mkdir rootfs
# 将编译好的 Wasm 模块拷贝到 rootfs 目录中，注意替换成自己对应的目录
cp ~/hands-on-lab/wasm/runtime/http-server/target/wasm32-wasi/release/http-server.wasm rootfs
```

使用 `youki spec` 命令生成默认的 config.json 配置文件，然后进行修改，和前面修改 crun 配置文件的内容是一样的：
- 1.在 args 中将 `sh` 替换为 `/http-server.wasm`。
- 2.在 annotations 中添加 `"module.wasm.image/variant": "compat"`，表明表明这是一个没有 guest OS 的 WebAssembly 应用程序。
- 3.在 network namespace 中添加 `"path": "/proc/1/ns/net"`，让程序与宿主机共享网络 namespace，方便在本机进行访问。

修改完成后的配置文件如下：

```bash
{
  "ociVersion": "1.0.2-dev",
  "root": {
    "path": "rootfs",
    "readonly": true
  },
  "mounts": [
    {
      "destination": "/proc",
      "type": "proc",
      "source": "proc"
    },
    {
      "destination": "/dev",
      "type": "tmpfs",
      "source": "tmpfs",
      "options": [
        "nosuid",
        "strictatime",
        "mode=755",
        "size=65536k"
      ]
    },
    {
      "destination": "/dev/pts",
      "type": "devpts",
      "source": "devpts",
      "options": [
        "nosuid",
        "noexec",
        "newinstance",
        "ptmxmode=0666",
        "mode=0620",
        "gid=5"
      ]
    },
    {
      "destination": "/dev/shm",
      "type": "tmpfs",
      "source": "shm",
      "options": [
        "nosuid",
        "noexec",
        "nodev",
        "mode=1777",
        "size=65536k"
      ]
    },
    {
      "destination": "/dev/mqueue",
      "type": "mqueue",
      "source": "mqueue",
      "options": [
        "nosuid",
        "noexec",
        "nodev"
      ]
    },
    {
      "destination": "/sys",
      "type": "sysfs",
      "source": "sysfs",
      "options": [
        "nosuid",
        "noexec",
        "nodev",
        "ro"
      ]
    },
    {
      "destination": "/sys/fs/cgroup",
      "type": "cgroup",
      "source": "cgroup",
      "options": [
        "nosuid",
        "noexec",
        "nodev",
        "relatime",
        "ro"
      ]
    }
  ],
  "process": {
    "terminal": false,
    "user": {
      "uid": 0,
      "gid": 0
    },
    "args": [
      "/http-server.wasm"
    ],
    "env": [
      "PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
      "TERM=xterm"
    ],
    "cwd": "/",
    "capabilities": {
      "bounding": [
        "CAP_KILL",
        "CAP_NET_BIND_SERVICE",
        "CAP_AUDIT_WRITE"
      ],
      "effective": [
        "CAP_KILL",
        "CAP_NET_BIND_SERVICE",
        "CAP_AUDIT_WRITE"
      ],
      "inheritable": [
        "CAP_KILL",
        "CAP_NET_BIND_SERVICE",
        "CAP_AUDIT_WRITE"
      ],
      "permitted": [
        "CAP_KILL",
        "CAP_NET_BIND_SERVICE",
        "CAP_AUDIT_WRITE"
      ],
      "ambient": [
        "CAP_KILL",
        "CAP_NET_BIND_SERVICE",
        "CAP_AUDIT_WRITE"
      ]
    },
    "rlimits": [
      {
        "type": "RLIMIT_NOFILE",
        "hard": 1024,
        "soft": 1024
      }
    ],
    "noNewPrivileges": true
  },
  "hostname": "youki",
  "annotations": {
     "module.wasm.image/variant": "compat"
  },
  "linux": {
    "resources": {
      "devices": [
        {
          "allow": false,
          "access": "rwm"
        }
      ]
    },
    "namespaces": [
      {
        "type": "pid"
      },
      {
        "type": "network",
        "path": "/proc/1/ns/net"
      },
      {
        "type": "ipc"
      },
      {
        "type": "uts"
      },
      {
        "type": "mount"
      },
      {
        "type": "cgroup"
      }
    ],
    "maskedPaths": [
      "/proc/acpi",
      "/proc/asound",
      "/proc/kcore",
      "/proc/keys",
      "/proc/latency_stats",
      "/proc/timer_list",
      "/proc/timer_stats",
      "/proc/sched_debug",
      "/sys/firmware",
      "/proc/scsi"
    ],
    "readonlyPaths": [
      "/proc/bus",
      "/proc/fs",
      "/proc/irq",
      "/proc/sys",
      "/proc/sysrq-trigger"
    ]
  }
}
```

通过 youki 启动容器。

```shell
youki run wasm-demo-app
```

在本地通过 curl 命令访问该服务。

```bash
curl http://localhost:8080
Hello, World!
```

如果想要停止并删除容器，可以执行以下命令。

```bash
youki kill wasm-demo-app SIGKILL
```

#### 5.2.3 高级容器运行时

在高级容器运行时中，使用不同的 shim 来对接各种低级容器运行时。在本节中，我们将以 containerd 为例进行介绍。containerd shim 充当 containerd 和低级容器运行时之间的桥梁，其主要功能是抽象了底层运行时的细节，使 containerd 能够统一地管理各种运行时。在 5.3 章节中将会介绍两种 containerd 管理 Wasm 工作负载的方式：
- containerd 使用 crun, youki 这两种支持 WasmEdge 的不同的低级容器运行时来管理 Wasm 模块。（当然这两个运行时也可以运行普通的 Linux 容器）
- containerd 通过 containerd-wasm-shim 直接通过 Wasm 运行时来管理 Wasm 模块。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20230828105002.png)

##### 5.2.3.1 Containerd + Crun

**请确保按照 5.2.2.1 小节安装好了 crun。**

使用以下命令安装 containerd。

```shell
export VERSION="1.7.3"
sudo apt install -y libseccomp2
sudo apt install -y wget

wget https://github.com/containerd/containerd/releases/download/v${VERSION}/cri-containerd-cni-${VERSION}-linux-amd64.tar.gz
wget https://github.com/containerd/containerd/releases/download/v${VERSION}/cri-containerd-cni-${VERSION}-linux-amd64.tar.gz.sha256sum
sha256sum --check cri-containerd-cni-${VERSION}-linux-amd64.tar.gz.sha256sum

sudo tar --no-overwrite-dir -C / -xzf cri-containerd-cni-${VERSION}-linux-amd64.tar.gz
sudo systemctl daemon-reload
sudo systemctl start containerd
```

然后我们可以通过 containerd 运行 Wasm 程序：
- --runc-binary：指定使用 crun 来启动容器。
- --runtime：指定 shim 的版本和名称，这将由 containerd 转换为 shim 的二进制名称，`io.containerd.runc.v2 -> containerd-shim-runc-v2`。containerd 会执行 containerd-shim-runc-v2 二进制文件来启动 shim，真正启动容器是通过 containerd-shim-runc-v2 去调用 crun 来启动容器的。
- --label：添加 `"module.wasm.image/variant": "compat"`，表明表明这是一个没有 guest OS 的 WebAssembly 应用程序。

```bash
# 先拉取镜像
ctr i pull docker.io/cr7258/wasm-demo-app:v1 

# 启动容器
ctr run --rm --net-host \
--runc-binary crun \
--runtime io.containerd.runc.v2 \
--label module.wasm.image/variant=compat \
docker.io/cr7258/wasm-demo-app:v1 \
wasm-demo-app
```

在本地通过 curl 命令访问该服务。

```bash
curl http://localhost:8080
Hello, World!
```

如果想要停止并删除容器，可以执行以下命令。

```bash
ctr task kill wasm-demo-app --signal SIGKILL
```

##### 5.2.3.2 Containerd + Youki

**请确保按照 5.2.2.2 小节安装好了 youki。**

我们可以通过 containerd 运行 Wasm 程序，并指定使用 youki 来启动容器。

```bash
ctr run --rm --net-host \
--runc-binary youki \
--runtime io.containerd.runc.v2 \
--label module.wasm.image/variant=compat \
docker.io/cr7258/wasm-demo-app:v1 wasm-demo-app
```

在本地通过 curl 命令访问该服务。

```bash
curl http://localhost:8080
Hello, World!
```

如果想要停止并删除容器，可以执行以下命令。

```bash
ctr task kill wasm-demo-app --signal SIGKILL
```

##### 5.2.3.3 Containerd + Runwasi

runwasi 是一个用 Rust 编写的库，属于 containerd 的子项目，使用 runwasi 可以编写用于对接 Wasm 运行时的 containerd wasm shim，通过 Wasm 运行时可以管理 Wasm 工作负载。当前使用 runwasi 编写的 containerd wasm shim 有以下几个：
- 在 [runwasi [2]](https://github.com/containerd/runwasi) 仓库中包含了 WasmEdge 和  Wasmtime 两种 containerd wasm shim 的实现。
- 在 [containerd-wasm-shims [3]](https://github.com/deislabs/containerd-wasm-shims) 仓库中包含了 Spin, Slight (SpiderLightning), Wasm Workers Server (wws), lunatic 四种 containerd wasm shim 的实现。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20230618224245.png)

我们直接使用 runwasi 提供的 wasmedge shim 来运行 Wasm 应用，首先克隆 runwasi 仓库。

```bash
git clone https://github.com/containerd/runwasi.git
cd runwasi
```

然后安装编译所需的依赖。

```bash
sudo apt-get -y install    \
      pkg-config          \
      libsystemd-dev      \
      libdbus-glib-1-dev  \
      build-essential     \
      libelf-dev          \
      libseccomp-dev      \
      libclang-dev        \
      libssl-dev
```

执行以下命令编译文件。

```
make build
sudo make install
```


然后我们使用 containerd 通过 WasmEdge shim 来运行 Wasm 应用：
- --runtime: 指定使用 `io.containerd.wasmedge.v1` 来运行 Wasm 应用。

```bash
ctr run --rm --net-host \
--runtime=io.containerd.wasmedge.v1 \
docker.io/cr7258/wasm-demo-app:v1 \
wasm-demo-app
```

在本地通过 curl 命令访问该服务。

```bash
curl http://localhost:8080
Hello, World!
```

如果想要停止并删除容器，可以执行以下命令。

```bash
ctr task kill wasm-demo-app --signal SIGKILL
```

### 5.3 在编排平台运行 Wasm 工作负载

#### 5.3.1 Docker Desktop 运行 Wasm

Docker Desktop 也使用了 runwasi 来支持 Wasm 工作负载，要在 Docker Desktop 中运行 Wasm 工作负载需要确保勾选以下两个选项：
- **Use containerd for storing and pulling images**
- **Enable Wasm**

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20230828210149.png)

点击 **Apply & restart** 应用更新，Docker Desktop 会下载并安装以下可用于运行 Wasm 工作负载的运行时：
- `io.containerd.slight.v1`
- `io.containerd.spin.v1`
- `io.containerd.wasmedge.v1`
- `io.containerd.wasmtime.v1`

在 Docker 中运行 WebAssembly 应用的方式与普通的 Linux 容器没有太大区别，只需要通过 `--runtime=io.containerd.wasmedge.v1` 指定使用相应的 Wasm 运行时即可。

```bash
docker run -d -p 8080:8080 \
--name=wasm-demo-app \
--runtime=io.containerd.wasmedge.v1 \
docker.io/cr7258/wasm-demo-app:v1
```

在本地通过 curl 命令访问该服务。

```bash
curl http://localhost:8080
Hello, World!
```

如果想要停止并删除容器，可以执行以下命令。

```bash
docker rm -f wasm-demo-app
```

#### 5.3.2 在 Kubernetes 中运行 Wasm 模块

Kubernetes 作为容器编排领域的事实标准，[WebAssembly 正在推动云计算的第三次浪潮 [4]](https://nigelpoulton.com/webassembly-the-future-of-cloud-computing/)，而 Kubernetes 正在不断发展以利用这一优势。

在 Kubernetes 中运行 Wasm 工作负载有两种方式：
- 1. 首先，我们需要使集群中节点的容器运行时支持运行 Wasm 工作负载。接下来，可以通过使用 RuntimeClass，将 Pod 调度到指定节点并指定特定的运行时。在 RuntimeClass 中通过 `handler` 字段指定运行 Wasm 工作负载的 handler，可以是支持 Wasm 的低级容器运行时（例如 crun, youki），也可以是 Wasm 运行时；通过 `scheduling.nodeSelector` 指定将工作负载调度到含有特定标签的节点。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20230830112535.png)

- 2.将专门用于运行 Wasm 的特殊节点（Krustlet）加入集群，通过标签选择器在调度时将 Wasm 工作负载指定到 Krustlet 节点。

Kind（Kubernetes in Docker） 是一个使用 Docker 容器运行本地 Kubernetes 集群的工具。为了方便实验，在 5.3.2 章节中将使用 Kind 来创建 Kubernetes 集群。使用以下命令安装 Kind。

```bash
[ $(uname -m) = x86_64 ] && curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.20.0/kind-linux-amd64
chmod +x ./kind
sudo mv ./kind /usr/local/bin/kind
```

Kubectl 是用于管理 Kubernetes 集群的命令行工作，执行以下命令安装 Kubectl。

```bash
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x kubectl
mv kubectl /usr/local/bin/kubectl
```

##### 5.3.2.1 Kubernetes + Containerd + Crun

使用以下命令创建一个单节点的 Kubernetes 集群。

```bash
kind create cluster --name wasm-demo
```

每个 Kubernetes Node 都是一个 Docker 容器，通过 docker exec 命令进入该节点。

```bash
docker exec -it  wasm-demo-control-plane bash
```

进入节点后，**请确保按照 5.2.2.1 小节安装好了 crun。**

修改 containerd 配置文件 /etc/containerd/config.toml，在文件末尾添加以下内容。
- 配置 crun 作为 containerd 的运行时 handler。格式是 `[plugins."io.containerd.grpc.v1.cri".containerd.runtimes.${HANDLER_NAME}]`。
- pod_annotations 表示允许把 Pod metadata 中设置的 Annotation `module.wasm.image/variant` 传递给 crun，因为 crun 需要通过这个 Annotation 来判断这是一个 Wasm 工作负载。

```bash
cat >> /etc/containerd/config.toml << EOF
[plugins."io.containerd.grpc.v1.cri".containerd.runtimes.crun]
    runtime_type = "io.containerd.runc.v2"
    pod_annotations = ["module.wasm.image/variant"]
[plugins."io.containerd.grpc.v1.cri".containerd.runtimes.crun.options]
    BinaryName = "crun"
EOF
```

然后重启 containerd。

```bash
systemctl restart containerd
```

创建一个名为 crun 的 RuntimeClass 资源，并使用之前在 containerd 中设置的 crun handler。接下来，在 Pod Spec 中指定 runtimeClassName 来使用该 RuntimeClass，以告知 kubelet 使用所指定的 RuntimeClass 来运行该 Pod。此外，设置 Annotation `module.wasm.image/variant: compat`，告诉 crun 这是一个 Wasm 工作负载。

```yaml
apiVersion: node.k8s.io/v1
kind: RuntimeClass
metadata:
  name: crun
handler: crun
---
apiVersion: v1
kind: Pod
metadata:
  name: wasm-demo-app
  annotations:
    module.wasm.image/variant: compat
spec:
  runtimeClassName: crun
  containers:
  - name: wasm-demo-app
    image: docker.io/cr7258/wasm-demo-app:v1
```

可以通过 port-forward 将端口转发到本地进行访问。

```bash
kubectl port-forward pod/wasm-demo-app 8080:8080
```

然后在另一个终端通过 curl 命令访问该服务。

```bash
curl http://localhost:8080
Hello, World!
```

测试完毕后，销毁该集群。

```bash
kind delete cluster --name wasm-demo
```
##### 5.3.2.2 KWasm Operator

Kwasm 是一个 Kubernetes Operator，可以为 Kubernetes 节点添加 WebAssembly 支持。当你想为某个节点增加 Wasm 支持时，只需为该节点添加 `kwasm.sh/kwasm-node=true` 的 Annotation 。随后，Kwasm 会自动创建一个 Job，负责在该节点上部署运行 Wasm 所需的二进制文件，并对 containerd 的配置进行相应的修改。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20230606194050.png)

使用以下命令创建一个单节点的 Kubernetes 集群。

```bash
kind create cluster --name kwasm-demo
```

Kwasm 提供了 Helm chart 方便用户进行安装，先执行以下命令安装 Helm。

```bash
curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3
chmod 700 get_helm.sh
./get_helm.sh
```

然后安装 Kwasm Operator，为所有节点添加 Annotation `kwasm.sh/kwasm-node=true` 启用对 Wasm 的支持。

```bash
# 添加 Helm repo
helm repo add kwasm http://kwasm.sh/kwasm-operator/
# 安装 KWasm operator
helm install -n kwasm --create-namespace kwasm-operator kwasm/kwasm-operator
# 为节点添加 Wasm 支持
kubectl annotate node --all kwasm.sh/kwasm-node=true
```

创建一个名为 crun 的 RuntimeClass 资源，并使用之前在 containerd 中设置的 crun handler。接下来，在 Pod Spec 中指定 runtimeClassName 来使用该 RuntimeClass，以告知 kubelet 使用所指定的 RuntimeClass 来运行该 Pod。此外，设置 Annotation `module.wasm.image/variant: compat`，告诉 crun 这是一个 Wasm 工作负载。

```yaml
apiVersion: node.k8s.io/v1
kind: RuntimeClass
metadata:
  name: crun
handler: crun
---
apiVersion: v1
kind: Pod
metadata:
  name: wasm-demo-app
  annotations:
    module.wasm.image/variant: compat
spec:
  runtimeClassName: crun
  containers:
  - name: wasm-demo-app
    image: docker.io/cr7258/wasm-demo-app:v1
```

Pod 运行成功后，可以通过 port-forward 将端口转发到本地进行访问。

```bash
kubectl port-forward pod/wasm-demo-app 8080:8080
```

我们在另一个终端通过 curl 命令访问该服务。

```bash
curl http://localhost:8080
Hello, World!
```

测试完毕后，销毁该集群。

```bash
kind delete cluster --name kwasm-demo
```
##### 5.3.2.3 Krustlet

Krustlet 是一个由 Rust 语言编写的 kubelet，它在 Kubernetes 集群中作为一个节点，专门用于运行 Wasm 工作负载。当 Kubernetes 调度器将 Pod 调度到 Krustlet 节点时，Krustlet 会利用 Wasm 运行时来启动相应的 Wasm 工作负载。尽管 Krustlet 项目目前已经很久没有更新了，但是还是值得了解一番。

使用以下命令创建一个单节点的 Kubernetes 集群。这里通过 --image 参数指定创建 1.21.14 版本的 Kubernetes 集群，Krustlet 最近一次更新还是在去年，可能不兼容最新的 Kubernetes 版本。我在最新的 Kubernetes 集群上测试后，发现 Krustlet 无法正常工作。

```bash
kind create cluster --name krustlet-demo --image kindest/node:v1.21.14@sha256:8a4e9bb3f415d2bb81629ce33ef9c76ba514c14d707f9797a01e3216376ba093
```

接下来我们需要启动一个 Krustlet 节点，并将它加入集群。对于普通的节点，我们可以使用 kubeadm join 命令很方便的将节点加入集群。因为 kubeadm 会替你做很多事，例如生成 bootstrap token，生成 kubelet 证书等等。

对于 Krustlet 节点我们就需要手动处理这些事情了，我们可以使用 Krustlet 官方准备的脚本。这个脚本会为我们创建 bootstrap token，这个 token 是 Krustlet 初始化时和 API Server 临时通信而使用的。脚本还会根据 token 生成 Krustlet 临时的 kubeconfig 文件，默认在 `console
~/.krustlet/config/kubeconfig`。

```bash
bash <(curl https://raw.githubusercontent.com/krustlet/krustlet/main/scripts/bootstrap.sh)
```

接着执行以下命令安装 Krustlet 二进制文件。

```bash
wget https://krustlet.blob.core.windows.net/releases/krustlet-v1.0.0-alpha.1-linux-amd64.tar.gz
tar -xzvf krustlet-v1.0.0-alpha.1-linux-amd64.tar.gz
mv krustlet-wasi /usr/local/bin/krustlet-wasi
```

最后，运行以下命令来启动 Krustlet：
- --node-ip：指定 Krustlet 的节点 IP，通常情况下 docker0 网卡的地址是 `172.17.0.1`，我们在本机启动的 Krustlet 要和 Kind 启动的 Kubernetes 集群进行通信，因此选择将 Krustlet 程序绑定在 docker0 所在的地址上。可以使用 `ip addr show docker0` 命令来确认 docker0 网卡的地址。
- --node-name：指定 Krustlet 的节点名。
- --bootstrap-file：指定前面通过脚本生成的 Krustlet 临时的 kubeconfig 的文件路径。
- KUBECONFIG=~/.krustlet/config/kubeconfig：执行该命令的时候，这个 kubeconfig 文件还没有生成，Krustlet 会在引导过程中生成私钥和证书，并创建 CSR 资源，当 CSR 被批准后，Krustlet 在该路径创建长期可用的 kubeconfig 文件，其中包含密钥和已签名的证书。

```bash
KUBECONFIG=~/.krustlet/config/kubeconfig \
krustlet-wasi \
--node-ip 172.17.0.1 \
--node-name=krustlet \
--bootstrap-file=${HOME}/.krustlet/config/bootstrap.conf
```

启动 Krustlet 后，提示我们需要手动批准 CSR 请求。当然我们也可以设置自动批准，这里先不展开说明。

```bash
BOOTSTRAP: TLS certificate requires manual approval. Run kubectl certificate approve instance-2-tls
```

执行以下命令，手动批准 CSR 请求。我们只需要在 Krustlet 第一次启动时执行此步骤，之后它会将所需的凭证保存下来。

```bash
kubectl certificate approve instance-2-tls
```

然后查看节点，就可以看到 Krustlet 节点已经成功注册到 Kubernetes 集群中了。

```bash
# kubectl get nodes -o wide
NAME                          STATUS   ROLES                  AGE     VERSION         INTERNAL-IP   EXTERNAL-IP   OS-IMAGE                         KERNEL-VERSION    CONTAINER-RUNTIME
krustlet                      Ready    <none>                 30s     1.0.0-alpha.1   172.17.0.1    <none>        <unknown>                        <unknown>         mvp
krustlet-demo-control-plane   Ready    control-plane,master   4m17s   v1.21.14        172.18.0.2    <none>        Debian GNU/Linux 11 (bullseye)   5.19.0-1030-gcp   containerd://1.7.1
```

查看节点信息，其架构显示是 wasm-wasi，并且节点上有 `kubernetes.io/arch=wasm32-wasi:NoExecute` 和 `kubernetes.io/arch=wasm32-wasi:NoSchedule` 两个污点，我们在创建 Pod 时需要指定容忍该污点才能调度到 Krustlet 节点上。

```
# kubectl describe node krustlet
Name:               krustlet
Roles:              <none>
Labels:             beta.kubernetes.io/arch=wasm32-wasi
                    beta.kubernetes.io/os=wasm32-wasi
                    kubernetes.io/arch=wasm32-wasi
                    kubernetes.io/hostname=instance-2
                    kubernetes.io/os=wasm32-wasi
                    type=krustlet
Annotations:        node.alpha.kubernetes.io/ttl: 0
                    volumes.kubernetes.io/controller-managed-attach-detach: true
CreationTimestamp:  Tue, 29 Aug 2023 02:55:19 +0000
Taints:             kubernetes.io/arch=wasm32-wasi:NoExecute
                    kubernetes.io/arch=wasm32-wasi:NoSchedule
Unschedulable:      false
Lease:
  HolderIdentity:  krustlet
  AcquireTime:     Tue, 29 Aug 2023 02:55:49 +0000
  RenewTime:       Tue, 29 Aug 2023 02:55:49 +0000
Conditions:
  Type        Status  LastHeartbeatTime                 LastTransitionTime                Reason                     Message
  ----        ------  -----------------                 ------------------                ------                     -------
  Ready       True    Tue, 29 Aug 2023 02:55:49 +0000   Tue, 29 Aug 2023 02:55:19 +0000   KubeletReady               kubelet is posting ready status
  OutOfDisk   False   Tue, 29 Aug 2023 02:55:19 +0000   Tue, 29 Aug 2023 02:55:19 +0000   KubeletHasSufficientDisk   kubelet has sufficient disk space available
Addresses:
  InternalIP:  172.17.0.1
  Hostname:    instance-2
Capacity:
  cpu:                4
  ephemeral-storage:  61255492Ki
  hugepages-1Gi:      0
  hugepages-2Mi:      0
  memory:             4032800Ki
  pods:               110
Allocatable:
  cpu:                4
  ephemeral-storage:  61255492Ki
  hugepages-1Gi:      0
  hugepages-2Mi:      0
  memory:             4032800Ki
  pods:               110
System Info:
  Machine ID:
  System UUID:
  Boot ID:
  Kernel Version:
  OS Image:
  Operating System:           linux
  Architecture:               wasm-wasi
  Container Runtime Version:  mvp
  Kubelet Version:            1.0.0-alpha.1
  Kube-Proxy Version:         v1.17.0
PodCIDR:                      10.244.0.0/24
PodCIDRs:                     10.244.0.0/24
Non-terminated Pods:          (0 in total)
  Namespace                   Name    CPU Requests  CPU Limits  Memory Requests  Memory Limits  Age
  ---------                   ----    ------------  ----------  ---------------  -------------  ---
Allocated resources:
  (Total limits may be over 100 percent, i.e., overcommitted.)
  Resource           Requests  Limits
  --------           --------  ------
  cpu                0 (0%)    0 (0%)
  memory             0 (0%)    0 (0%)
  ephemeral-storage  0 (0%)    0 (0%)
  hugepages-1Gi      0 (0%)    0 (0%)
  hugepages-2Mi      0 (0%)    0 (0%)
Events:
  Type    Reason          Age   From             Message
  ----    ------          ----  ----             -------
  Normal  RegisteredNode  36s   node-controller  Node krustlet event: Registered Node krustlet in Controller
```

和前面直接在容器运行时里运行 Wasm 镜像不同，Krustlet 只支持 media types 是 `application/vnd.wasm.config.v1+json` 的 OCI 镜像，我们之前构建的镜像的 media types 是 `application/vnd.oci.image.layer.v1.tar+gzip`。详情参见：[Open Containers Initiative [5]](https://github.com/opencontainers/artifacts/blob/main/artifact-authors.md#visualizing-artifacts)。

因此我们需要使用 wasm-to-oci 这个工具来构建镜像，wasm-to-oci 是一个用于将 Wasm 模块发布到注册表的工具，它打包模块并将其上传到注册表。执行以下命令，安装 wasm-to-oci。

```bash
wget https://github.com/engineerd/wasm-to-oci/releases/download/v0.1.2/linux-amd64-wasm-to-oci
mv linux-amd64-wasm-to-oci /usr/local/bin/wasm-to-oci
chmod +x /usr/local/bin/wasm-to-oci
```

当前暂不支持将 Wasm 模块直接推送到 Docker Hub 上，因此这里我们选择使用 [GitHub Package Registry [6]](https://github.com/features/packages) 来存放 Wasm 模块。

```bash
docker login ghcr.io
Username:  # Github 用户名
Password:  # Github Token
```

另外由于 Krustlet 是基于 wasmtime 来运行 Wasm 工作负载的，并且 wasmitime 目前暂不支持 HTTP，详情参见：[WASI Proposals Support [7]](https://docs.wasmtime.dev/stability-wasi-proposals-support.html)。

因此我们这里写一个简单的打印 Hello, World 的 Rust 程序。执行以下命令构建一个新的 Rust 项目。

```bash
cargo new hello-world
```

然后在 main.rs 文件中添加以下代码。

```rust
use std::thread;
use std::time::Duration;

fn main() {
    loop {
        println!("Hello, World!");
        thread::sleep(Duration::from_secs(1));
    }
}
```

执行以下命令，将程序编译为 Wasm 模块。

```bash
cargo build --target wasm32-wasi --release
```

使用 wasm-to-oci 将编译好的 Wasm 模块上传到 GitHub Package Registry。

```bash
wasm-to-oci push target/wasm32-wasi/release/hello-world.wasm ghcr.io/cr7258/wasm-demo-app:oci
```

可以看到镜像的 media types 是 `application/vnd.wasm.config.v1+json`。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20230829144042.png)

为了方便测试，我们将镜像设置为公开的。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20230829112719.png)

然后创建 Pod 使用该镜像，添加容忍运行调度到 Krustlet 节点上，由于我们的 Kubernetes 集群中只有一个节点，因此不用设置节点选择器。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: wasm-demo-app
spec:
  containers:
    - name: wasm-demo-app
      image: ghcr.io/cr7258/wasm-demo-app:oci
  tolerations:
    - key: "kubernetes.io/arch"
      operator: "Equal"
      value: "wasm32-wasi"
      effect: "NoExecute"
    - key: "kubernetes.io/arch"
      operator: "Equal"
      value: "wasm32-wasi"
      effect: "NoSchedule"
```

查看 Pod 日志可以看到每隔 1s 打印 Hello, World!。

```bash
kubectl logs wasm-demo-app

Hello, World!
Hello, World!
Hello, World!
```

测试完毕后，销毁该集群。

```bash
kind delete cluster --name krustlet-demo
```

## 6 总结

本文首先阐述了 WebAssembly 基本概念以及其相较于传统容器的优势，然后介绍了使用 Rust 开发 Wasm 应用的流程。接着，为读者详细展示了在各种环境中运行 Wasm 工作负载的方法，涵盖了在 Linux 容器、支持 Wasm 的容器运行时，以及编排平台上的运行方法。

本文使用到的代码以及配置文件可以在我的 Github 上找到：https://github.com/cr7258/hands-on-lab/tree/main/wasm/runtime 。

## 7 附录

### 7.1 关于 compat 和 compat-smart 注解

本文中使用 `"module.wasm.image/variant": "compat"`  Annotation 来告诉容器运行时这是 Wasm 工作负载，当前 crun 支持了一个新的 Annotation `"module.wasm.image/variant": "compat-smart"` 。详情参见：[WasmEdge issue: Add crun "-smart" annotation [8]](https://github.com/WasmEdge/WasmEdge/issues/1338)。

当使用 `compat-smart` 注解时，`crun` 可以根据工作负载是 Wasm 还是普通 OCI 容器来智能地选择容器的启动方式。这种选择只会在标准 OCI 容器和 Wasm 应用程序位于同一个 pod 中时产生影响。下面是一个示例的 Pod 资源文件，其中包含一个 Wasm 应用程序和一个普通的 Linux 应用程序。

```yaml
apiVersion: node.k8s.io/v1
kind: RuntimeClass
metadata:
  name: crun
handler: crun
---
apiVersion: v1
kind: Pod
metadata:
  name: wasm-demo-app
  annotations:
    module.wasm.image/variant: compat-smart
spec:
  runtimeClassName: crun
  containers:
  - name: wasm-demo-app
    image: docker.io/cr7258/wasm-demo-app:v1
  - name: linux-demo-app
    image: nginx:1.20
```

### 7.2 Krustlet 报错

在启动 Krustlet 的时候可能会遇到以下报错：

```bash
libssl.so.1.1: cannot open shared object file: No such file or directory
```

原因是 Krustlet 依赖 openssl 1.1 版本，可以参考该链接解决：[解决报错 libssl.so.1.1 [9]](https://blog.csdn.net/estelle_belle/article/details/111181037)

### 7.3 WasmEdge 报错

在用容器运行时启动容器的时候可能会出现以下报错。

```bash
FATA[0000] failed to create shim task: OCI runtime create failed: could not load `libwasmedge.so.0`: `libwasmedge.so.0: cannot open shared object file: No such file or directory`: unknown
```

重新执行 WasmEdge 安装命令。

```bash
curl -sSf https://raw.githubusercontent.com/WasmEdge/WasmEdge/master/utils/install.sh | bash
```

## 8 参考资料
- [1] WebAssembly vs Linux Container: https://wasmedge.org/wasm_linux_container/
- [2] runwasi: https://github.com/containerd/runwasi
- [3] containerd-wasm-shims: https://github.com/deislabs/containerd-wasm-shims
- [4] WebAssembly 正在推动云计算的第三次浪潮: https://nigelpoulton.com/webassembly-the-future-of-cloud-computing
- [5] Open Containers Initiative: https://github.com/opencontainers/artifacts/blob/main/artifact-authors.md#visualizing-artifacts
- [6] GitHub Package Registry: https://github.com/features/packages
- [7] WASI Proposals Support: https://docs.wasmtime.dev/stability-wasi-proposals-support.html
- [8] WasmEdge issue: Add crun "-smart" annotation: https://github.com/WasmEdge/WasmEdge/issues/1338
- [9] 解决报错 libssl.so.1.1: https://blog.csdn.net/estelle_belle/article/details/111181037
- [10] WasmEdge Docs: https://wasmedge.org/docs/
- [11]  Kwasm: https://kwasm.sh/
- [12] 各种容器运行时都解决了什么问题: https://www.zeng.dev/post/2020-container-runtimes/
- [13] Container Runtimes Part 3: High-Level Runtimes: https://www.ianlewis.org/en/container-runtimes-part-3-high-level-runtimes
- [14] WebAssembly and its platform targets: https://snarky.ca/webassembly-and-its-platform-targets/
- [15] WebAssembly: Docker without containers!: https://wasmlabs.dev/articles/docker-without-containers/
- [16] Standardizing WASI: A system interface to run WebAssembly outside the web: https://hacks.mozilla.org/2019/03/standardizing-wasi-a-webassembly-system-interface/
- [17] Manage WebAssembly Apps Using Container and Kubernetes Tools: https://www.secondstate.io/articles/manage-webassembly-apps-in-wasmedge-using-docker-tools/
- [18] Build and Manage Wasm Applications using Container Tools - Michael Yuan, WasmEdge: https://www.youtube.com/watch?v=kOvoBEg4-N4
- [19] Executing WebAssembly (Wasm) modules in containers using crun, podman, and MicroShift: https://www.youtube.com/watch?v=3fudsMOkRCM
- [20] What's New in Docker + Wasm Technical Preview 2?: https://kodekloud.com/blog/whats-new-in-docker-wasm-technical-preview-2/#
- [21] Running WebAssembly Applications on Kubernetes with WasmEdge | Mirantis Labs - Tech Talks: https://www.youtube.com/watch?v=--T-JFFNGlE
- [22] Running Wasm in a container: https://atamel.dev/posts/2023/06-29_run_wasm_in_docker/
- [23] Cloud Native Apps with Server-Side WebAssembly - Liam Randall, Cosmonic: https://www.youtube.com/watch?v=2OTyBxPyW7Q
- [24] Containerd Adds Support for a New Container Type: Wasm Containers: https://www.infoq.com/news/2023/02/containerd-wasi/
- [25] Using WebAssembly and Kubernetes in Combination: https://alibaba-cloud.medium.com/using-webassembly-and-kubernetes-in-combination-7553e54ea501
- [26] Run WASM applications from Kubernetes: https://msazure.club/run-wasm-applications-from-kubernetes/
- [27] A First Look at Wasm and Docker: https://dev.to/docker/a-first-look-at-wasm-and-docker-5dg0
- [28] What is runwasi: https://nigelpoulton.com/what-is-runwasi/
- [29] Getting started with Docker + Wasm: https://nigelpoulton.com/getting-started-with-docker-and-wasm/
- [30] Wasm and Kubernetes – Working Together: https://collabnix.com/wasm-and-kubernetes-working-together/
- [31] Rust microservices in server-side WebAssembly: https://blog.logrocket.com/rust-microservices-server-side-webassembly
- [32] What is cloud native WebAssembly: https://nigelpoulton.com/what-is-cloud-native-webassembly/
- [33] Compile Rust & Go to a Wasm+Wasi module and run in a Wasm runtime
- [34] Cloud Native Wasm Day EU 2023: Summaries, Insights, and Opinions: https://cosmonic.com/blog/industry/cloud-native-wasm-day-2023-wrap-up

## 9 欢迎关注
![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220104221116.png)
