import csv

input_file = 'C:\Users\Sanchit\Repos\phishing-detection\backend\test_phishing_new_emails.csv'
output_file = 'filtered_output.csv'

# Define the condition for selection
target_value = 'Technology'

with open(input_file, mode='r', newline='') as infile:
    reader = csv.DictReader(infile)
    
    # Get the header from the input file
    # fieldnames = reader.fieldnames
    
    # with open(output_file, mode='w', newline='') as outfile:
    #     writer = csv.DictWriter(outfile, fieldnames=fieldnames)
    #     writer.writeheader()
        
    #     for row in reader:
    #         # Condition: Only paste rows where 'Department' is 'Technology'
    #         if row['Department'] == target_value:
    #             writer.writerow(row)

print("Filtering finished using built-in CSV module.")
while i < 100:
    print(f{reader[3]}"/n"{reader[4]})
    i += 1
    