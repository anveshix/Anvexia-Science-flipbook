# Optional: serve the SAME static index.html from nginx.
# No build step, no npm, no runtime — everything is already inside the HTML file.
# Digest-pinned stable nginx 1.30.6-alpine (multi-arch index, Docker Hub 2026-11-03).
FROM nginx:1.30.6-alpine@sha256:583b7f2fce1cdb8da5ad5c39ebd3c33b98b87d493190e548bdee1fa8c619c311

COPY index.html /usr/share/nginx/html/index.html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Fail the image build immediately if the hardened config is invalid.
RUN nginx -t

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -q -O /dev/null http://127.0.0.1/index.html || exit 1
