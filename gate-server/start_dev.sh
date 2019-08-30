#启动脚本
docker run -dit -p 3000:3000 -v /mnt/hgfs/dev/gate_server/:/app/data/ --privileged=true docker/appjs