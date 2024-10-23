
# Node-Docker-DAG
## Overview
`node-docker-dag` is a repository designed to run data pipelines for Stacks and other data sources that lack strong Python support. By leveraging Node.js and Docker, this repository allows the execution of complex data workflows while avoiding the need to rewrite existing codebases in Python. Airflow is used to schedule and orchestrate the execution of these pipelines, ensuring efficient and reliable processing across various data sources.

# Key Features
* Node.js Support: This repository is built for data pipelines where Node.js has better library support, particularly for sources like the Stacks blockchain.
* Dockerized Pipelines: Each pipeline is executed in a Docker container, ensuring consistency and portability across different environments.
* Airflow Integration: Airflow is used to manage and schedule the pipeline execution, providing a powerful orchestration tool to automate workflows.
* Minimal Python Rewrite: Instead of rewriting large Node.js codebases in Python, this repository keeps the existing structure intact by running the pipelines in Node.js while Airflow handles scheduling.

# Use Cases
* Stacks Blockchain Pipelines: Fetch and process data from the Stacks blockchain using Node.js libraries and process it efficiently.
* Non-Python Friendly Data Sources: For data sources that have limited or no Python support, node-docker-dag provides a reliable alternative by allowing pipelines to be executed in Node.js.

# How It Works
1. Pipeline Development: Develop your data pipelines in Node.js, utilizing the vast ecosystem of JavaScript libraries.
2. Docker Container: Package your code into a Docker container, ensuring a consistent environment for execution.
3. Airflow Scheduling: Schedule and orchestrate the pipeline execution using Airflow DAGs, allowing for automated, reliable, and scalable data processing.
4. Data Processing: The pipeline fetches data from the source, processes it, and outputs it to the desired destination, such as a database, data lake, or external service.

# Setup
1. Clone the Repository:

```
git clone https://github.com/your-repo/node-docker-dag.git
cd node-docker-dag
```

2. Run locally

```
npm run build
node dist/zest.js
```

3. Build the Docker Image:

```
docker build -t node-docker-dag .
```

3. Run the Container:

```
docker run -d node-docker-dag
```

4. Airflow Setup: Set up Airflow to schedule the pipeline by defining DAGs that reference the Docker container.

# Contributing
Contributions are welcome! Feel free to submit pull requests or issues to improve this repository.