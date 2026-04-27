# 基础镜像
FROM mongo:7
LABEL maintainer="fivex"

# 创建目录
RUN mkdir -p /home/fivex/mongo/data && \
    mkdir -p /home/fivex/mongo/logs

# 指定路径
WORKDIR /home/fivex/mongo

# 挂载目录
VOLUME ["/home/fivex/mongo/data", "/home/fivex/mongo/logs"]

# 复制初始化脚本到容器（首次启动自动执行）
COPY ./conf/mongo-init.js /docker-entrypoint-initdb.d/mongo-init.js

EXPOSE 27017