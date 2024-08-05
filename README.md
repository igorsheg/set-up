<p align="center">
  <strong>Set Up!</strong>
</p>

<p align="center">
  <i>is an open-source implementation of a fast-paced, real-time multiplayer card game.</i>
</p>

<p align="center">
  
![setup](https://github.com/igorsheg/set-up/blob/main/.github/images/setup.gif?raw=true)
</p>

## Development Setup

1. Set up environment variables:
   ```
   cp .env.example .env
   ```

2. Set up and build the frontend:

   ```
   cd web
   yarn install
   yarn build
   cd ..
   ```

3. Set up and run the Rust backend:

   ```
   cargo run
   ```

4. Start playing at `http://localhost:5432` (or your configured port)

## Project Structure

- `/web`: React frontend
- `/src`: Rust backend

## Contributing

Contributions are welcome! Whether it's bug fixes, feature additions, or documentation improvements, feel free to fork the repository and submit a pull request.
