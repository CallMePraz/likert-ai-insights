import mysql.connector
import csv
from datetime import datetime

# MySQL connection
mysql_conn = mysql.connector.connect(
    host='localhost',
    user='root',
    password='adm   can 123',
    database='dev_DBLikert'
)
mysql_cursor = mysql_conn.cursor(dictionary=True)

# Get all data from MySQL
mysql_cursor.execute('SELECT * FROM surveyData')
rows = mysql_cursor.fetchall()

# Create a CSV file with proper quoting
with open('surveyData_proper.csv', 'w', newline='', encoding='utf-8') as csvfile:
    fieldnames = ['id', 'date', 'rating', 'comment', 'branch', 'Teller_ID', 'sentiment', 'created_at', 'updated_at']
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames, quoting=csv.QUOTE_ALL)
    writer.writeheader()
    
    for row in rows:
        # Convert datetime objects to strings
        row['date'] = row['date'].strftime('%Y-%m-%d')
        row['created_at'] = row['created_at'].strftime('%Y-%m-%d %H:%M:%S')
        row['updated_at'] = row['updated_at'].strftime('%Y-%m-%d %H:%M:%S')
        
        # Write the row with proper quoting
        writer.writerow(row)

# Close MySQL connection
mysql_cursor.close()
mysql_conn.close()