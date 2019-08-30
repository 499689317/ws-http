#启动脚本
docker run -dit -p 7000:7000 -v /data/log-server/:/app/data/ --privileged=true docker/appjs