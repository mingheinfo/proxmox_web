##后端代码部署
   安装proxmox-ve_6.2-1.iso版本
##前端代码部署
    1、下载代码 https://github.com/mingheinfo/proxmox_web.git
	2、在package.json目录下运行  npm run build
    3、编译完成后在public目录下得到 dist目录
	4、安装nginx apt-get install nginx
	5、在/etc/nginx下创建crt目录执行
	   Linux系统下生成证书：
       1、生成秘钥key,运行:
       openssl genrsa -des3 -out server.key 2048
       会有两次要求输入密码,输入同一个即可输入密码然后你就获得了一个server.key文件. 
       2、以后使用此文件(通过openssl提供的命令或API)可能经常回要求输入密码,如果想去除输入密码的步骤可以使用以下命令:
          openssl rsa -in server.key -out server.key
       3、创建服务器证书的申请文件server.csr,运行:
          openssl req -new -key server.key -out server.csr
         其中Country Name填CN,Common Name填主机名也可以不填,如果不填浏览器会认为不安全.(例如你以后的url为https://abcd/xxxx….这里就可以填abcd),其他的都可以不填. 
       4、创建CA证书:
          openssl req -new -x509 -key server.key -out ca.crt -days 3650
          此时,你可以得到一个ca.crt的证书,这个证书用来给自己的证书签名. 
       5、创建自当前日期起有效期为期十年的服务器证书server.crt：
          openssl x509 -req -days 3650 -in server.csr -CA ca.crt -CAkey server.key -CAcreateserial -out server.crt
       6、 ls你的文件夹,可以看到一共生成了5个文件:
          ca.crt   ca.srl    server.crt   server.csr   server.key其中,server.crt和server.key就是你的nginx需要的证书文件. 
	6、将3步得到的dist目录下的文件放置到 /var/www/mhflex 目录下
	7、配置nginx.conf文件 将package.json统计目录下nginx.conf文件替换/etc/nginx/nginx.conf文件
	8、完成以上步骤后执行 nginx 命令
	打开链接 https://ip:3000/login 就可以测试相关业务了

##截图：
  
   


