#启动脚本
docker run -dit -p 5000:5000 -p 8000:8000 -v /data/logic-server/:/app/data/ --privileged=true docker/appjs