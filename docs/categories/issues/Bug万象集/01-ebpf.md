---
title: eBPF
author: Se7en
date: 2024/12/07 10:00
categories:
 - Bug万象集
tags:
 - eBPF
---

# eBPF

## 编译 eBPF 程序时报错：'asm/types.h' file not found

编译 eBPF 程序时出现 `'asm/types.h' file not found` 报错：

```bash
root@ebpf-demo:/media/psf/Code/hands-on-lab/ebpf/loadbalancer/sockops# go generate
In file included from /media/psf/Code/hands-on-lab/ebpf/loadbalancer/sockops/sockops.bpf.c:2:
In file included from /usr/include/linux/bpf.h:11:
/usr/include/linux/types.h:5:10: fatal error: 'asm/types.h' file not found
#include <asm/types.h>
         ^~~~~~~~~~~~~
1 error generated.
Error: compile: exit status 1
exit status 1
main.go:17: running "go": exit status 1
```

实际去 `/usr/include` 目录下看，发现没有 asm 这个目录，而有一个 asm-generic 目录。

```bash
ls /usr/include/asm-generic/
auxvec.h          fcntl.h           ioctls.h       msgbuf.h       sembuf.h       signal.h   swab.h      unistd.h
bitsperlong.h     hugetlb_encode.h  ipcbuf.h       param.h        setup.h        socket.h   termbits.h
bpf_perf_event.h  int-l64.h         kvm_para.h     poll.h         shmbuf.h       sockios.h  termios.h
errno-base.h      int-ll64.h        mman-common.h  posix_types.h  siginfo.h      stat.h     types.h
errno.h           ioctl.h           mman.h         resource.h     signal-defs.h  statfs.h   ucontext.h
```

手动创建软链接到 asm，重新编译即可。

```bash
ln -s /usr/include/asm-generic/ /usr/include/asm
```
