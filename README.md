kasha
=====

kasha is a subscription based caching application.

Example usage:

```
POST url=http://localhost:3000/subscriptions body={url:http://some.json.service.com/data.json}
```

will create a new subscription for http://some.json.service.com/data.json

use the returned subscriptionId to access it thereafter:

```
GET url=http://localhost:3000/subscriptions/:subscriptionId
```

will return the cached response from http://some.json.service.com/data.json

-----

The cache for each item is refreshed every 10 minutes, and requests are spread out over those 10 minutes e.g.: 5 subscriptions = 1 call every 2 minutes, 10 subscriptions = 1 call per minute, 1000 subscriptions = 1 call per 0.6s