# 🔧 دليل حل المشاكل (Troubleshooting Guide)

## المشاكل اللي حصلت والحلول

### 1. Kafka - ImagePullBackOff ❌
**الأعراض:**
```
kafka-xxx   0/1   ImagePullBackOff
```

**السبب:**
- النسخ `bitnami/kafka:3.6.0` و `3.4` كانت بتفشل في التحميل من Docker Hub
- ممكن يكون في مشاكل شبكة أو النسخة دي مش متوفرة في المنطقة بتاعتك
- Bitnami images أحياناً بتكون كبيرة وبطيئة في التحميل

**الحل:**
- استخدمنا الـ **Official Apache Kafka Image**: `apache/kafka:3.7.0`
- ده أخف وأسرع في التحميل وأكثر استقراراً
- الملف: `infra/k8s/kafka/kafka-kraft-deployment.yaml`

---

### 2. MongoDB - CrashLoopBackOff ❌
**الأعراض:**
```
mongodb-xxx   0/1   CrashLoopBackOff
```

**السبب:**
- MongoDB 6.0 بيحتاج CPU instructions معينة (AVX)
- الأجهزة القديمة أو VMs مش بتدعم الـ features دي
- بيعمل crash فوراً عند التشغيل

**الحل:**
- نزلنا النسخة لـ `mongo:4.4` (بتشتغل على أي جهاز)
- الملف: `infra/k8s/mongo-deployment.yaml`

---

### 3. Nginx - 403 Forbidden ❌
**الأعراض:**
- لما تفتح `http://<MINIKUBE_IP>:30080` بيظهر "403 Forbidden"
- الـ Pod شغال بس الموقع مش بيفتح

**السبب:**
- الـ `nginx.conf` كان بيتنسخ في المكان الغلط (`/usr/share/nginx/html`)
- المفروض يكون في `/etc/nginx/nginx.conf`
- Nginx كان بيستخدم الـ default config اللي بيرفض الوصول
- **أو:** الملفات عندها permissions غلط (770) فـ Nginx مش قادر يقراها

**الحل:**
- عدلنا الـ `Dockerfile` عشان ينسخ `nginx.conf` في المكان الصح
- ضفنا `chmod -R 644` عشان نصلح الـ permissions
- الملف: `apps/frontend/Dockerfile`

---

### 4. Nginx Gateway Configuration ✅
**التحسين:**
- ضفنا API Gateway في `nginx.conf`
- دلوقتي الـ Frontend بيكلم الـ Backend عن طريق `/api/...` مش direct ports
- ده بيحقق الـ 5-Tier Architecture

---

## التحديثات على السكريبت

### ✅ Input Validation
- السكريبت دلوقتي **بيرفض أي إدخال غلط**
- لازم تختار `1` أو `2` فقط
- لو دخلت حرف أو رقم تاني، هيطلب منك تدخل تاني

### ✅ Automatic Cleanup
- **كل مرة تشغل فيها `deploy.sh`، بيمسح الديبلويمنت القديم أوتوماتيك**
- مش محتاج تجاوب على أي سؤال
- بيمسح:
  - Namespace القديم
  - كل الـ Pods
  - كل الـ Containers
  - Docker Compose (لو موجود)

---

---

## 🔄 لو عدلت في الـ Frontend (nginx.conf أو HTML/CSS/JS)

**المشكلة:**
- عدلت ملفات الـ Frontend بس التعديلات مش ظاهرة
- الـ Pod لسه بيستخدم الـ image القديم

**الحل:**
```bash
cd ~/StartUP/Brand/scripts
./deploy.sh
```
(اختار `1` للـ Local، وهيعمل rebuild تلقائي للـ Frontend)

---

## كيفية التأكد إن كل حاجة شغالة

بعد ما تشغل `./scripts/deploy.sh`، استنى 2-3 دقيقة وشغل:

```bash
kubectl get pods -n mysakn-app
```

**النتيجة المفروضة:**
```
NAME                                    READY   STATUS    RESTARTS   AGE
auth-service-xxx                        1/1     Running   0          2m
booking-service-xxx                     1/1     Running   0          2m
frontend-xxx                            1/1     Running   0          2m
housing-service-xxx                     1/1     Running   0          2m
kafka-xxx                               1/1     Running   0          2m
kafka-ui-xxx                            1/1     Running   0          2m
mongodb-xxx                             1/1     Running   0          2m
notification-service-xxx                1/1     Running   0          2m
```

**كل الـ Pods لازم تكون `Running` و `READY` يكون `1/1`**
