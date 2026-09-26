FROM nginx:1.27-alpine

COPY index.html style.css app.js /usr/share/nginx/html/
COPY src /usr/share/nginx/html/src

EXPOSE 80
