docker pull sequenceiq/hadoop-docker:2.7.1
docker run -h localhost -p 50070:50070 -p 50075:50075 -it sequenceiq/hadoop-docker:2.7.1 /etc/bootstrap.sh -bash