# Version 1

About how to start node server
1. install node 4.*
2. npm install
if you encounter error about canvas, please refer to he hint below
3. run "nohup node index.js &"

About error in npm insall

1. Package cairo was not found in the pkg-config search path
sudo yum install cairo cairo-devel cairomm-devel libjpeg-turbo-devel pango pango- devel pangomm pangomm-devel giflib-devel

2. c++11
cd /etc/yum.repos.d 
wget http://people.centos.org/tru/devtools/devtools.repo
yum --enablerepo=testing-devtools-6 install devtoolset-1.0
export PATH=/opt/centos/devtoolset-1.0/root/usr/bin/:$PATH
$ g++ --version
 g++ (GCC) 4.7.0 20120507 (Red Hat 4.7.0-5) Copyright (C) 2012 Free Software Foundation, Inc.
This is free software; see the source for copying conditions. There is NO warranty; not even for MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.

3. yum install xorg-x11-font*



About guard process

1. copy health-check folder to a specific place
2. modify the path in "health_check/script/start-nodejs"
3. modify the path in "health_check/bin/nodejs-health-check.sh"
4. modify the path in "process_monitor.sh"

Server related

120.26.227.136 root loQShZsD9yf6E9CivaQFDp4SVv9D4w
外网：115.29.160.155     内网：10.161.133.19      密码：E958vmQfgEwxCCAv

couchbase related

120.26.227.136 root loQShZsD9yf6E9CivaQFDp4SVv9D4w

couchbase:

local:
http://172.20.2.15:8091/index.html
admin
adminRky2015
curl -X POST -u admin:adminRky2015 http://172.20.2.15:8091/pools/default/buckets/open.rongcapital.cn/controller/doFlush

dev:
http://10.200.48.132:8091/
http://10.200.48.132:8091/pools
ropcouchbase
CAl9JgMmd7MVeWjc
55 23 * * * curl -X POST -u ropcouchbase:CAl9JgMmd7MVeWjc http://10.200.48.132:8091/pools/default/buckets/open.rongcapital.cn/controller/doFlush

pro:
http://121.199.15.17:8091/index.html
内网：10.132.15.194
用户名：ropcouchbase
密码： X3K0396OlnH4dGxJ
curl -X POST -u ropcouchbase:X3K0396OlnH4dGxJ http://121.199.15.17:8091/pools/default/buckets/open.rongcapital.cn/controller/doFlush


ruixue_isv/ruixue_ssv
rop123456
rop_test@123

netstat -ant | grep -i listen  | grep 80
lsof | grep -i listen | grep 80
ps -ef | grep xxx



third party lib
node end play with npm, you may find the configuration in package.json file from the root dir
for web page end play with bower, you may find the directory information from .bowerrc and configuration information from bower.json file

##关于Windows的安装
请参考https://github.com/Automattic/node-canvas/wiki/Installation---Windows
步骤

### Dependencies

Building the node-canvas module requires:

1. A global installation of [node-gyp](https://github.com/TooTallNate/node-gyp), which requires:
  - Python 2.7 for Windows
  - Microsoft Visual C++ 2010 or later
2. GTK 2
3. For optional JPEG support (pending [#841](https://github.com/Automattic/node-canvas/pull/841)): libjpeg-turbo

### 1. Installing node-gyp

- Run the latest [2.7.x Python installer](http://www.python.org/getit/) (`v3.x.x` is _**not**_ supported).
- Install Visual Studio. [Community](https://go.microsoft.com/fwlink/?LinkId=532606&clcid=0x409) and [Express](https://go.microsoft.com/fwlink/?LinkId=615464&clcid=0x409) are both free. Community is a bigger installation but provides more features; Express is sufficient. When installing, ensure that you select the option for C++ support. You can also try the C++ Build Tools as described [here](https://github.com/nodejs/node-gyp/issues/629#issuecomment-153196245).
- Install node-gyp globally with `npm install -g node-gyp`.

*Notes:*

- We've tested Visual Studio 2010, 2013 and 2015, x86 and x64.
- Ensure the Python directory (e.g `C:\Program Files\Python`) is available in `PATH`.
- You can force gyp to use a specific edition of VS, by providing a `--msvs_version=2013` hint to `npm install canvas` (if you're installing from scratch) or `node-gyp rebuild` (if you're building node-canvas).
- If anything goes wrong, please refer to the [node-gyp documentation](https://github.com/TooTallNate/node-gyp#installation).

### 2. Installing GTK 2

You will need the [cairo](http://cairographics.org) library which is bundled in GTK. Download the GTK 2 bundle for [Win32](http://ftp.gnome.org/pub/GNOME/binaries/win32/gtk+/2.24/gtk+-bundle_2.24.10-20120208_win32.zip) or [Win64](http://ftp.gnome.org/pub/GNOME/binaries/win64/gtk+/2.22/gtk+-bundle_2.22.1-20101229_win64.zip). Unzip the contents in `C:\GTK`.

*Notes:*

- Both GTK and Node.js need either be 64bit or 32bit to compile successfully.
- Download GTK 2, _**not GTK 3**_, which is missing the required libpng. If you get linker errors you've most likely picked the wrong bundle.
- If you use a different location than `C:\GTK`, add a `GTK_Root` argument to `npm install` or `node-gyp rebuild`. For example: `node-gyp rebuild --GTK_Root=C:\somewhere\GTK`.

### 3. Installing libjpeg-turbo

Download the latest [libjpeg-turbo SDK for Visual C++](http://sourceforge.net/projects/libjpeg-turbo/files/) (currently `libjpeg-turbo-1.5.1-vc.exe` or `libjpeg-turbo-1.5.1-vc64.exe`) and install to its default location (`C:\libjpeg-turbo` if 32bit or `C:\libjpeg-turbo64` if 64bit).

*Notes:*

- Both libjpeg-turbo and Node.js need either be 64bit or 32bit to compile successfully.
- If you use a different location, add a `jpeg_root` argument to `npm install` or `node-gyp rebuild`. For example: `node-gyp rebuild --jpeg_root=C:\somewhere\libjpeg-turbo`.

### Build instructions

In the root of the node-canvas module you may use node-gyp to build the native module:

    node-gyp rebuild

### If you got Error C2373 with vs2015 update3

This error stays in relation with npm, node-gyp and Visual Studio 2015 and is already fixed in node-gyp@3.4.0, but npm is still pointing to an old version. As I workaround I can propose this:

Go to your folder where npm is installed, e.g.: C:\Program Files\nodejs\node_modules\npm
Open: package.json
Remove entry for node-gyp in bundleDependencies
Bump version number to 3.4.0 for node-gyp in dependencies
Make a npm i in this directory to install node-gyp@3.4.0 to fix the problem

# Version 3

July,4th 2016 build
1. install node 6.x
2. build couchbase
3. build canvas
4. run 'npm start'

5. (run if needed)
   cd ~/Downloads
   curl ftp://ftp.mirrorservice.org/sites/sourceware.org/pub/gcc/releases/gcc-4.9.2/gcc-4.9.2.tar.bz2 -O
   tar xvfj gcc-4.9.2.tar.bz2

   cd gcc-4.9.2
   ./configure --disable-multilib --enable-languages=c,c++
   make -j 4
   make install

6. (run if needed)
   will take a long time to build, after that we could use the required gcc to build <couchbase> and <canvas>

7. make sure the BAS code is uncommented every time we make upgrade

8. API 状态
   0--未审核   （1--申请审核，修改，删除）
   1--申请审核  （修改，删除）
   2--已审核  （3--申请上线，修改，删除）
   3--申请上线（修改）
   4--上线  （5--申请修改,废弃）
   #xxxx 已废弃 5--申请修改  （撤销）
   6--上线后修改 （修改，3--申请上线，撤销）
   101--拒绝审核 （修改，1--申请审核）
   103--拒绝上线 （修改，3--申请上线）
   #xxxx 已废弃 105--拒绝修改 （5--申请修改）
   106--申请废弃 （撤销）
   107--审核废弃(状态自动变成停用） （108-申请恢复）
   108-申请恢复

   Domain 状态
   0：基本状态（如果该结构没有被使用，可以直接修改，如果已经被api或者其他结构使用，需要申请修改1, 删除同理）
   #xxx 已废弃 1：申请修改（申请上线,删除）
   2：审核修改（修改,撤销, 申请上线,删除）
   4：申请上线 (修改,撤销,删除)
   5：拒绝上线（申请上线,修改,撤销,删除）
   #xxx 已废弃 3：拒绝修改（申请修改,删除）

9. password
帐号：admin 		密码：rop_test@123
帐号：ruixue_ssv 	密码：rop_test@123
帐号：ruixue_isv 	密码：rop_test@123

http://10.200.48.134:8080/?ws=10.200.48.134:8080&port=5858

http://open.rongcapital.cn
帐号：admin 		密码：rongcapital@q1w2e3r4t5
帐号：ruixue_ssv 	密码：ros@qwe123
帐号：ruixue_isv 	密码：ros@qwe123


# Version 4
Another migration that required gcc setup, note here

Error: Building GCC requires GMP 4.2+, MPFR 2.3.1+ and MPC 0.8.0+
http://www.multiprecision.org/mpc 下载mpc-0.9.tar.gz
ftp://ftp.gnu.org/gnu/gmp/gmp-5.0.1.tar.bz2下载gmp-5.0.1.tar.bz2
http://ftp.gnu.org/gnu/mpfr/下载mpfr-3.1.0.tar.xz

先开始安装GMP。解压GMP的压缩包后，得到源代码目录gmp-5.0.1。在该目录的同级目录下建立一个临时的编译目录，这里命名为temp。然后开始配置安装选项，进入temp目录，输入以下命令进行配置：
　　../gmp-5.0.1/configure --prefix=/data/gmp-5.0.1
make
sudo make install
mpfr和mpc的安装方法与gmp类似。不过要注意配置的时候要把gmp与mpfr的依赖关系选项加进去，具体配置命令如下：
　　../mpfr-3.1.0/configure --prefix=/data/mpfr-3.1.0 --with-gmp=/data/gmp-5.0.1
　　../mpc-0.9/configure --prefix=/data/mpc-0.9 --with-gmp=/data/gmp-5.0.1 --with-mpfr=/data/mpfr-3.1.0
　　安装好这三个库之后，就可以正式开始安装gcc了。
当然了链接的时候，需要刚刚编译的3个lib。
export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:/data/mpc-0.9/lib:/data/gmp-5.0.1/lib:/data/mpfr-3.1.0/lib:/data/isl-0.12.2/lib　

./configure --prefix=/data/gcc-4.9.3 --enable-threads=posix --disable-checking --disable-multilib --enable-languages=c,c++ --with-gmp=/data/gmp-5.0.1 --with-mpfr=/data/mpfr-3.1.0 --with-mpc=/data/mpc-0.9
./configure --disable-multilib --enable-languages=c,c++ --with-gmp=/data/gmp-5.0.1 --with-mpfr=/data/mpfr-3.1.0 --with-mpc=/data/mpc-0.9

export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:/data/mpc-0.9/lib:/data/gmp-5.0.1/lib:/data/mpfr-3.1.0/lib:/data/isl-0.12.2/lib

echo ‘LD_LIBRARY_PATH =/data/mpc-0.9/lib:/data/gmp-5.0.1/lib:/data/mpfr-3.1.0/lib:/data/gcc-4.9.2/lib:/data/gcc-4.9.2/lib64: $LD_LIBRARY_PATH’ >> /etc/profile

#####这种方法在重启终端后失效，所以直接将他写入/etc/profile比较好


# Version 5
增加了requirejs，用依赖注入和模块化的方式管理代码，取消gulp脚本，添加 lessc 新插件，用于直接输入最小化css
npm install -g less-plugin-clean-css

build文件夹在使用模块化后已经被deprecated，不推荐使用，console 是一个老模块，还在使用 /root/public/build 中的资源，因为console要逐步被新模块替换掉，所以还要保留build文件夹

关于日志分析模块高度耦合的表
首页
表头.md-datatable.excel.fixed，固定不动，3160px宽，其中tbody有.total，用于统计
滚动滑块scroller，继承了虚拟滚动，用于大批量数据节省渲染资源，3160px宽
内表，.md-datatable.excel，可以滚动，3160px宽

按API统计
总表，.ebony .md-datatable，3104宽，显示的首页要被点击查看的数据
hero区，图形表头，.hero-grid .md-datatable.fixed，固定不动，2784px宽
hero区，图形表滑块，.hero-grid .scroller 用于进行内表滑动，原则上认为数据不多，未采用虚拟滚动，2784px宽
hero区，IP图形表，.hero-grid .scroller .md-datatable，默认作用于按IP搜索，2784px宽，用于切换图形
hero区，App图形表，.hero-grid.app .scroller .md-datatable，作用于按App搜索，3104px宽，比IP多了一个"开发者名称"，用于切换图形
belly区，错误显示表头，.body.belly .md-datatable.fixed，固定不动，768像素宽
belly区，错误显示表滑块，.body.belly .scroller，100%宽
belly区，错误显示表体，.body.belly .scroller .md-datatable.excel，100%宽

按IP统计
总表，.ebony .md-datatable，3104宽，显示的首页要被点击查看的数据
hero区，表头，.hero-grid.lg .md-datatable.fixed，固定不动，2840px宽
hero区，表滑块，.hero-grid.lg .scroller 用于进行内表滑动，原则上认为数据不多，未采用虚拟滚动，2840px宽
hero区，表体，.hero-grid.lg .scroller .md-datatable，2840px宽

按小时统计
总表，.ebony .md-datatable，3104宽，显示的首页要被点击查看的数据
hero区，API表头，.hero-grid.lg .md-datatable.fixed，固定不动，2840px宽
hero区，API表滑块，.hero-grid.lg .scroller 用于进行内表滑动，原则上认为数据不多，未采用虚拟滚动，2840px宽
hero区，API表体，.hero-grid.lg .scroller .md-datatable，2840px宽
hero区，IP表头，.hero-grid.md .md-datatable.fixed，固定不动，2784px宽
hero区，IP表滑块，.hero-grid.md .scroller 用于进行内表滑动，原则上认为数据不多，未采用虚拟滚动，2784px宽
hero区，IP表体，.hero-grid.md .scroller .md-datatable，2784px宽

关于mac的跳板机连不上测试服务器问题
如有如下错误
"-bash: warning: setlocale: LC_CTYPE: cannot change locale (UTF-8): No such file or directory"
请检查Terminal > Preferences > Select Terminal type such as Basic (default) > Advanced tab
必须反选‘Set locale environment variables on startup’

关于跳板机
ssh-add -l
ssh-add id_rsa
ssh -p 1024 shiqifeng@121.52.221.199 -A
ssh shiqifeng@10.200.48.134 -A

关于服务器git
如果不能clone到本地，请检查您gitlab上的ssh key是否正确注册过
git init
git remote add origin git@gitlab.dataengine.com:shiqifeng/ROP-Node.git
git fetch origin
git checkout -f -b Dev origin/Dev
git checkout -b shiqifeng origin/shiqifeng
git checkout -b master origin/master

根据各个业务不同，各个页面loading 页面都不同
集成jenkins， token=shiqifeng

关于SSE初始失效问题，修改nginx config 文件location中以下属性即可
proxy_buffering off;
proxy_cache off;
chunked_transfer_encoding off;


#Version 6

http://10.205.16.46:8091/index.html
user：ropcouchbase
pass：admin123
