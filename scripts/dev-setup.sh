#! /bin/bash

#psql -c "CREATE USER acm WITH LOGIN NOSUPERUSER INHERIT NOCREATEROLE NOREPLICATION PASSWORD 'ACM_dev!';" && \
psql -c "CREATE DATABASE membership_portal;" && \
psql -c "GRANT ALL PRIVILEGES ON DATABASE membership_portal TO acm;"
