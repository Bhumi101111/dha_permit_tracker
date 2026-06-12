# Single-image build: builds the React client and runs the Express server,
# which serves both the API and the built client from one port.
FROM node:20-slim

WORKDIR /app

# Copy everything and install + build.
COPY . .

# Installs server & client deps, builds the React app, and generates the sample Excel.
RUN npm run build

# Koyeb (and most PaaS) inject PORT; default to 8000 locally.
ENV PORT=8000
EXPOSE 8000

CMD ["npm", "start"]
