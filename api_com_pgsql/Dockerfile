# syntax=docker/dockerfile:1
# FROM python:3.7.0-alpine
FROM python:3.8-slim
# create directory for the app user
RUN mkdir -p /home/app
WORKDIR /home/app
COPY . /home/app
# RUN apk add --no-cache gcc musl-dev g++ make zlib zlib-dev jpeg-dev
RUN pip3 install --upgrade pip
RUN pip3 install -r requirements.txt

# create the app user
RUN addgroup --system app && adduser --system --group app

# chown all the files to the app user
RUN chown -R app:app /home/app

EXPOSE 8000

# change to the app user
USER app
ENTRYPOINT ["/home/app/entrypoint.sh"]
# ENTRYPOINT ["gunicorn", "-c", "gunicorn_config.py", "run:app"]