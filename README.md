# simple-music-server



# Preview

## imgtu.com CDN

```html
<img src="https://z3.ax1x.com/2021/04/09/cN3qKJ.gif">
<img src="https://z3.ax1x.com/2021/04/09/cN3Wbn.gif">
```



## Github[./preview]

<img src="./preview/uploader.gif">

<img src="./preview/form.gif">



# Usage

  1. **make sure you have [node](https://nodejs.org) env**

  2. **clone / download project**

  3. **install node_modules**

     ```bash
     # yarn
     yarn
     
     # npm
     npm install
     ```

4. **open your terminal**

   ```bash
   node ./bin/www
   ```

5. **open http://localhost:39999 in your browser(chrome/firefox/edg/ie10+)**



# For dev

## server(express)

```bash
# router
./routes

# database
./db

# web page
./public/uploader/dist/index.html
```



### API simple example

### get token 

* **request**

  ```
  GET /token
  ```

* **reqponse**

  ```json
  {
  	"status": "ok",
  	"result": "195109000f1b21f176fe6dd4f8e65df9bc70d5d07f2f3d387ec8c6faec2f9dbe",
  	"error": {}
  }
  ```



### get music 

* **request**

  ```bash
  # rule /music/name?token=foo
  GET /music/aa?token=xxx
  ```

* **reqponse**

  ```json
  {
  	"status": "ok",
  	"result": [
          {
              "id": 0,
              "name": "song aa 1",
              "xxx": "xxx"
          },
          {
              "id": 1,
              "name": "song aabb 2",
              "xxx": "xxx"
          }
      ],
  	"error": {}
  }
  ```

### create music

* **request**

  ```bash
  # rule /music?token=foo
  POST /music?token=xxx
  
  name=aaa&singer=bbb
  ```

* **reqponse**

  ```json
  {
  	"status": "ok",
  	"result": "success",
  	"error": {}
  }
  ```



### update music

* **request**

  ```bash
  # rule /music/id?token=foo
  PUT /music/0?token=xxx
  
  name=aaa&singer=bbb
  ```

* **reqponse**

  ```json
  {
  	"status": "ok",
  	"result": "success",
  	"error": {}
  }
  ```



### delete music

* **request**

  ```bash
  # rule /music/id?token=foo
  DELETE /music/1?token=xxx
  ```

* **reqponse**

  ```json
  {
  	"status": "ok",
  	"result": "success",
  	"error": {}
  }
  ```



## web page

**webpack, mvc**

```bash
# webpack config 
./public/uploader/.babelrc
./public/uploader/webpack.common.js
./public/uploader/webpack.dev.js
./public/uploader/webpack.prod.js

# entry
./public/uploader/src/index.js

# components
./public/uploader/src/components/xxx-xxx/xxx-xxx.js
./public/uploader/src/components/xxx-xxx/xxx-xxx.less
```



