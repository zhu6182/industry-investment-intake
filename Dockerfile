FROM alpine:3.19
WORKDIR /app
COPY . /app
RUN echo "Hello from Render!" > /tmp/test.txt
CMD ["cat", "/tmp/test.txt"]
