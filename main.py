from flask import Flask, request, jsonify, render_template
import json
import os

app = Flask(__name__)
DATA_FILE = 'reading_records.json'

if not os.path.exists(DATA_FILE):
    with open(DATA_FILE, 'w') as f:
        json.dump([], f)


def read_records():
    with open(DATA_FILE, 'r') as f:
        return json.load(f)


def write_records(records):
    with open(DATA_FILE, 'w') as f:
        json.dump(records, f)


@app.route('/')
def index():
    records = read_records()
    return render_template('index.html', records=records)


@app.route('/add', methods=['POST'])
def add_record():
    new_record = request.form.to_dict()
    records = read_records()
    records.append(new_record)
    write_records(records)
    return jsonify(new_record), 201


if __name__ == '__main__':
    app.run(debug=True)
