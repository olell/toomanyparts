FROM python:3.11
COPY tomapa-server/requirements.txt /requirements.txt
RUN pip install --no-cache-dir -r /requirements.txt
RUN rm /requirements.txt
COPY tomapa-server /server
WORKDIR /server

CMD ["gunicorn","tomapa:app","-b","0.0.0.0:8081"]
