## 一、准备工作

- ### [安装 kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/#install-kubectl)

```bash
$ brew install kubernetes-cli
...
$ kubectl version
Client Version: version.Info{Major:"1", Minor:"11", GitVersion:"v1.11.2", GitCommit:"bb9ffb1654d4a729bb4cec18ff088eacc153c239", GitTreeState:"clean", BuildDate:"2018-08-08T16:31:10Z", GoVersion:"go1.10.3", Compiler:"gc", Platform:"darwin/amd64"}
Server Version: version.Info{Major:"1", Minor:"10+", GitVersion:"v1.10.1-25+cbc1f79f9924ea", GitCommit:"cbc1f79f9924ea45ae0618a3544986226abb8469", GitTreeState:"clean", BuildDate:"2018-05-07T11:43:18Z", GoVersion:"go1.9.3", Compiler:"gc", Platform:"linux/amd64"}
```

- ### 部署 kubernetes 集群
  - 安装 Minikube，推荐使用 Minikube v0.28 以上来体验，请参考[这里]( https://github.com/kubernetes/minikube)
  - 购买 Aliyun (推荐新加坡节点，国内的下载镜像巨慢), GKE 等商业版，GKE 首次注册送 $300

- ### [配置 kubectl 访问集群](https://kubernetes.io/cn/docs/tasks/access-application-cluster/configure-access-multiple-clusters/)

设置完成后，通过 `kubectl cluster-info` 确保连接到正确的集群
```bash
$ kubectl config use-context default
Switched to context "default".

$ kubectl cluster-info
Kubernetes master is running at https://161.117.69.35:6443
Heapster is running at https://161.117.69.35:6443/api/v1/namespaces/kube-system/services/heapster/proxy
KubeDNS is running at https://161.117.69.35:6443/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy
monitoring-influxdb is running at https://161.117.69.35:6443/api/v1/namespaces/kube-system/services/monitoring-influxdb/proxy

To further debug and diagnose cluster problems, use 'kubectl cluster-info dump'.
```

- ### 安装 Helm

Helm 是 Kubernetes的一个包管理工具，用来简化 Kubernetes 应用的部署和管理
```bash
$ brew install kubernetes-helm
```

## 二、部署 SOFA Mesh

- ### 下载 SOFA Mesh 源码

```bash
$ git clone git@github.com:alipay/sofa-mesh.git
```

- ### 使用 Helm 安装 SOFA Mesh

```bash
$ helm install install/kubernetes/helm/istio --name istio --namespace istio-system
```

- ### 验证部署是否成功

```bash
$ kubectl get svc -n istio-system
NAME                       TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)                                 AGE
istio-citadel              ClusterIP   172.16.113.0     <none>        8060/TCP,9093/TCP                       2m
istio-egressgateway        ClusterIP   172.16.93.234    <none>        80/TCP,443/TCP                          2m
istio-galley               ClusterIP   172.16.199.113   <none>        443/TCP,9093/TCP                        2m
istio-pilot                ClusterIP   172.16.94.105    <none>        15010/TCP,15011/TCP,8080/TCP,9093/TCP   2m
istio-policy               ClusterIP   172.16.152.158   <none>        9091/TCP,15004/TCP,9093/TCP             2m
istio-sidecar-injector     ClusterIP   172.16.226.86    <none>        443/TCP                                 2m
istio-statsd-prom-bridge   ClusterIP   172.16.18.241    <none>        9102/TCP,9125/UDP                       2m
istio-telemetry            ClusterIP   172.16.200.109   <none>        9091/TCP,15004/TCP,9093/TCP,42422/TCP   2m
prometheus                 ClusterIP   172.16.157.229   <none>        9090/TCP                                2m
```

istio-system 命名空间下的 pod 状态都是 Running 时，说明已经部署成功

```bash
$ kubectl get pods -n istio-system
NAME                                        READY     STATUS              RESTARTS   AGE
istio-citadel-965587bb-vzmtd                0/1       ContainerCreating   0          2m
istio-cleanup-secrets-w6vnw                 0/1       ContainerCreating   0          2m
istio-egressgateway-5745bd96f-ph2jn         0/1       ContainerCreating   0          2m
istio-galley-5cb74d5b55-pjh4d               0/1       ContainerCreating   0          2m
istio-ingressgateway-65cd86fcd-m9kth        0/1       ContainerCreating   0          2m
istio-pilot-649899d9f6-gfrhb                0/1       ContainerCreating   0          2m
istio-policy-6b5d7945f6-t4hxs               0/1       ContainerCreating   0          2m
istio-sidecar-injector-58bb8694c5-hxbgz     0/1       ContainerCreating   0          2m
istio-statsd-prom-bridge-7f44bb5ddb-n8vz9   0/1       ContainerCreating   0          2m
istio-telemetry-6d94577dfc-ffs25            0/1       ContainerCreating   0          2m
prometheus-84bd4b9796-l4dxm                 0/1       ContainerCreating   0          2m
```

## 三、部署 DUBBO 示例

网络拓扑图
![image](https://user-images.githubusercontent.com/1207064/45411063-dbe6df80-b6a5-11e8-9b31-e2183f04bf6d.png)



- ### 下载示例仓库

```bash
$ git clone git@github.com:gxcsoccer/k8s-mesh-rpc.git
```

- ### 创建独立的命名空间

e2e-dubbo 命名空间下默认注入 sidecar

```bash
$ kubectl apply -f kubernetes/e2e-dubbo-ns.yaml
```

- ### 部署示例应用

创建 Deployments
```bash
$ kubectl apply -f kubernetes/dubbo-consumer.yaml
$ kubectl apply -f kubernetes/dubbo-provider-v1.yaml
$ kubectl apply -f kubernetes/dubbo-provider-nodejs.yaml
```

创建 Services
```bash
$ kubectl apply -f kubernetes/dubbo-consumer-service.yaml
$ kubectl apply -f kubernetes/dubbo-provider-service.yaml
```

- ### 确保示例启动成功

```bash
$ kubectl get pods -n e2e-dubbo

NAME                                     READY     STATUS    RESTARTS   AGE
e2e-dubbo-consumer-75f96f5f6-dkz2x       2/2       Running   0          13m
e2e-dubbo-provider-v1-6966bcb497-vxz6t   2/2       Running   0          3h
e2e-dubbo-provider-v2-795dfb68dc-r5dbc   2/2       Running   0          3h
e2e-dubbo-provider-v3-9f8d6b9b6-7gtv4    2/2       Running   0          38m
```

```bash
$ kubectl get services -n e2e-dubbo
NAME                 TYPE           CLUSTER-IP     EXTERNAL-IP     PORT(S)           AGE
e2e-dubbo-consumer   ClusterIP      172.19.15.83   <none>          8080/TCP          3h
e2e-dubbo-provider   ClusterIP      172.19.0.18    <none>          12345/TCP         3h
```

## 四、验证基本功能

- ### 启动代理

```bash
$ kubectl proxy
Starting to serve on 127.0.0.1:8001
```

- ### 通过代理访问 Consumer 的 HTTP 服务

请求两次，看到了两个版本（v1, v2 是 nodejs）
```bash
$ curl http://127.0.0.1:8001/api/v1/namespaces/e2e-dubbo/services/e2e-dubbo-consumer:8080/proxy/sayHello?name=dubbo-mosn
Hello, dubbo-mosn (from Spring Boot dubbo e2e test) [e2e-dubbo-provider-v1-6966bcb497-vxz6t/172.16.1.150]%

$ curl http://127.0.0.1:8001/api/v1/namespaces/e2e-dubbo/services/e2e-dubbo-consumer:8080/proxy/sayHello?name=dubbo-mosn
Hello, dubbo-mosn (from Nodejs dubbo e2e test) [e2e-dubbo-provider-v3-9f8d6b9b6-7gtv4/172.16.1.152]%
```

## 五、验证路由能力

验证 Version Route 能力，将流量都指定到 v1 版本

创建 DestinationRule
```bash
$ kubectl apply -f kubernetes/dubbo-consumer.destinationrule.yaml
```
```yaml
# dubbo-consumer.destinationrule.yaml
apiVersion: networking.istio.io/v1alpha3
kind: DestinationRule
metadata:
  name: e2e-dubbo-provider
  namespace: e2e-dubbo
spec:
  host: e2e-dubbo-provider
  subsets:
  - name: v1
    labels:
      ver: v1
  - name: v2
    labels:
      ver: v2
```

```bash
$ kubectl apply -f kubernetes/dubbo-consumer.version.vs.yaml
```

```yaml
# dubbo-consumer.version.vs.yaml
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: e2e-dubbo-provider
  namespace: e2e-dubbo
spec:
  hosts:
    - e2e-dubbo-provider
  http:
  - route:
    - destination:
        host: e2e-dubbo-provider
        subset: v1
```

再次请求，应该都路由到 v1 版本上了

```bash
$ curl http://127.0.0.1:8001/api/v1/namespaces/e2e-dubbo/services/e2e-dubbo-consumer:8080/proxy/sayHello?name=dubbo-mosn
Hello, dubbo-mosn (from Spring Boot dubbo e2e test) [e2e-dubbo-provider-v1-6966bcb497-vxz6t/172.16.1.150]%

$ curl http://127.0.0.1:8001/api/v1/namespaces/e2e-dubbo/services/e2e-dubbo-consumer:8080/proxy/sayHello?name=dubbo-mosn
Hello, dubbo-mosn (from Spring Boot dubbo e2e test) [e2e-dubbo-provider-v1-6966bcb497-vxz6t/172.16.1.150]%

$ curl http://127.0.0.1:8001/api/v1/namespaces/e2e-dubbo/services/e2e-dubbo-consumer:8080/proxy/sayHello?name=dubbo-mosn
Hello, dubbo-mosn (from Spring Boot dubbo e2e test) [e2e-dubbo-provider-v1-6966bcb497-vxz6t/172.16.1.150]%
```
