---
title: 使用 ClashX 代理 SSH 连接
author: Se7en
date: 2024/12/27 22:00
categories:
 - SSH
tags:
 - SSH
 - 代理
---

# 使用 ClashX 代理 SSH 连接

有时通过 SSH 连接国外的服务器会被防火墙拒绝，为了解决这个问题，可以使用 ClashX 来代理 SSH 连接。ClashX 是一个拥有 GUI 界面基于 Clash 可自定义规则的 macOS 代理应用。你也可以选择其他的代理软件，例如 Shadowsocks 等。

## 修改 SSH 客户端配置文件

编辑 `~/.ssh/config` 文件，添加如下配置：

- Host：定义一个主机别名，可以是一个自定义、容易记忆的名称。
- User：定义要连接的远程主机的用户名。
- HostName：定义要连接的远程主机的主机名或 IP 地址。
- Port：定义要连接的远程主机的端口号。
- IdentityFile：定义要使用的 SSH 私钥文件的路径。
- ProxyCommand：定义要使用的代理命令，这里使用 nc（netcat）工具，通过 127.0.0.1:7890 的 SOCKS5 代理连接到目标主机 %h（HostName）的 %p（Port）。其中 7890 是 ClashX 代理默认的端口号，可以根据实际情况调整。

```bash
Host 34.95.63.65
	User root
	HostName 34.95.63.65 
	Port 443
	IdentityFile ~/.ssh/id_rsa
	ProxyCommand nc -x 127.0.0.1:7890 -X 5 %h %p
```

## 新增 SSH 服务端的端口

大部分机场会关闭 SSH 默认的 22 端口，有的机场甚至只开放 80 和 443 端口。根据上面的客户端配置，我们在 SSH 服务器上开放 443 端口。

进入服务器，打开 `/etc/ssh/sshd_config`，找到：

```bash
#Port 22
#AddressFamily any
```

这里 Port 22 默认被注释掉，因为原本 22 就是默认端口。将这里修改为：

```bash
Port 22
Port 443
```

这里我新增 Port 443，你可以修改为你想要设置的其他端口，但是请注意端口不要冲突。22 端口同样打开，这样你可以同时在这两个端口中选择使用进行 SSH 连接。

修改完毕后，重启 SSH 服务。

```bash
sudo systemctl restart sshd
```

## 测试 SSH 连接

一切正常的话，我们就可以通过代理进行 SSH 连接了。

```bash
ssh root@34.95.63.65
```

如果不确定有没有走 Proxy，可以打开 ClashX 的 Dashboard 查看连接中是否有对应的连接即可。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202412272302479.png)

## 常见错误

如果在 SSH 连接过程中遇到以下错误，说明是机场封禁了 SSH 端口，可以尝试其他端口。 

```bash
kex_exchange_identification: Connection closed by remote host
Connection closed by UNKNOWN port 65535
```

## 参考资料

- [使用 ClashX 为 SSH 加速](https://george.betterde.com/technology/20220215.html)
- [Using Proxy for SSH](https://alleny.xyz/post/ssh-over-proxy/)
