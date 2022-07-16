const CACHE_NAME="v1"
const urlsToCache=["index.html", "offline.html"]
const showOffline = "index.html"
const self=this;

//install sw
self.addEventListener("install",function(e){
    e.waitUntil(
        caches.open(CACHE_NAME)
        .then((cache)=>{
            console.log("Open Cache");
            return cache.addAll(urlsToCache)
        })
    )
});


//listen for req
self.addEventListener("fetch",function(e){
    e.respondWith(
        caches.match(e.request)
        .then(()=>{
            return fetch(e.request)
            .catch(()=>{ caches.match(showOffline)})
            
        
        })
    )
});


//activate sw
self.addEventListener("activate",function(e){
    const cacheWhitelist = [];
    cacheWhitelist.push(CACHE_NAME);

    e.waitUntil(
        caches.keys().then((cacheNames) => Promise.all(
            cacheNames.map((cacheName) => {
                if(!cacheWhitelist.includes(cacheName)) {
                    return caches.delete(cacheName);
                }
            })
        ))
        )   

});