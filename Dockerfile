FROM python:3.11

COPY tomapa-server/requirements.txt /requirements.txt
RUN pip install --no-cache-dir -r /requirements.txt
RUN rm /requirements.txt

RUN apt update
RUN apt install -y --no-install-recommends nodejs npm


COPY tomapa-server /server

COPY tomapa-frontend /frontend
WORKDIR /frontend
RUN npm install
RUN npm run build
RUN cp -r build/ /server/tomapa/static/frontend

WORKDIR /server
RUN rm -r /frontend

CMD ["gunicorn","tomapa:app","-b","0.0.0.0:8081"]
