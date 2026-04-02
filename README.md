# Reading Record Web

A simple web application to track and manage your reading history.

## Features

- 📚 Add and store reading records
- 📝 Track book titles, authors, and notes
- 🔍 View all your reading history in one place
- 💾 Persistent JSON storage

## Tech Stack

- **Backend**: Flask (Python)
- **Frontend**: HTML Templates
- **Storage**: JSON file

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/zengzzzzz/reading-record-web.git
   cd reading-record-web
   ```

2. Install dependencies:
   ```bash
   pip install flask
   ```

3. Run the application:
   ```bash
   python main.py
   ```

4. Open your browser and visit: `http://localhost:5000`

## Usage

- **View Records**: The homepage displays all your reading records
- **Add Record**: Use the form to add new books to your reading list
- **Data Storage**: All records are saved in `reading_records.json`

## Project Structure

```
.
├── main.py              # Flask application entry point
├── reading_records.json # Data storage
├── templates/
│   └── index.html       # Web interface
├── README.md
├── LICENSE
└── .gitignore
```

## License

MIT License - see LICENSE file for details.

## Contributing

Feel free to submit issues or pull requests to improve the application!
