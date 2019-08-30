#启动脚本
docker run -dit -p 7000:7000 -v /mnt/hgfs/dev/log-server/:/app/data/ --privileged=true docker/appjs