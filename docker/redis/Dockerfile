# 基础镜像
FROM redis:7-alpine
LABEL maintainer="fivex"

# 创建目录
RUN mkdir -p /home/fivex/redis/data

# 指定路径
WORKDIR /home/fivex/redis

# 复制配置文件
COPY ./conf/redis.conf /home/fivex/redis/redis.conf

# 挂载数据目录
VOLUME /home/fivex/redis/data

EXPOSE 6379

# 使用自定义配置启动（原始镜像默认不加载配置，需显式指定）
CMD ["redis-server", "/home/fivex/redis/redis.conf"]
