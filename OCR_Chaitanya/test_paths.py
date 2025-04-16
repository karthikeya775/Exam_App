import os
import json
import sys

def test_paths():
    """Test script to verify file paths and permissions for OCR application"""
    
    print("===== Testing OCR Application Paths =====")
    
    # Get the directory of the script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    print(f"Script directory: {script_dir}")
    
    # Check if uploads directory exists
    uploads_path = os.path.join(script_dir, 'uploads')
    print(f"Uploads path: {uploads_path}")
    
    if not os.path.exists(uploads_path):
        print(f"Creating uploads directory at: {uploads_path}")
        try:
            os.makedirs(uploads_path, exist_ok=True)
            print("✓ Uploads directory created successfully")
        except Exception as e:
            print(f"✗ Error creating uploads directory: {str(e)}")
            return False
    else:
        print("✓ Uploads directory exists")
        
    # Test write permissions to uploads directory
    test_file = os.path.join(uploads_path, 'test_write.txt')
    try:
        with open(test_file, 'w') as f:
            f.write("Test write permission")
        print(f"✓ Successfully wrote to uploads directory")
        os.remove(test_file)
    except Exception as e:
        print(f"✗ Cannot write to uploads directory: {str(e)}")
        return False
        
    # Check metadata file
    metadata_path = os.path.join(script_dir, 'document_metadata.json')
    print(f"Metadata path: {metadata_path}")
    
    if not os.path.exists(metadata_path):
        print(f"Creating metadata file at: {metadata_path}")
        try:
            with open(metadata_path, 'w') as f:
                json.dump([], f)
            print("✓ Metadata file created successfully")
        except Exception as e:
            print(f"✗ Error creating metadata file: {str(e)}")
            return False
    else:
        print("✓ Metadata file exists")
    
    # Test read/write permission on metadata file
    try:
        with open(metadata_path, 'r') as f:
            try:
                data = json.load(f)
                print(f"✓ Successfully read metadata file: {len(data)} entries")
            except json.JSONDecodeError:
                print("✗ Metadata file contains invalid JSON")
                with open(metadata_path, 'w') as f:
                    json.dump([], f)
                print("✓ Reset metadata file to empty array")
    except Exception as e:
        print(f"✗ Cannot read metadata file: {str(e)}")
        return False
        
    # Test write permission on metadata file
    try:
        with open(metadata_path, 'r') as f:
            data = json.load(f)
            
        test_entry = {
            "test": True,
            "timestamp": str(os.path.getmtime(metadata_path))
        }
        data.append(test_entry)
        
        with open(metadata_path, 'w') as f:
            json.dump(data, f, indent=4)
            
        print("✓ Successfully wrote to metadata file")
        
        # Clean up test entry
        data.pop()
        with open(metadata_path, 'w') as f:
            json.dump(data, f, indent=4)
            
    except Exception as e:
        print(f"✗ Cannot write to metadata file: {str(e)}")
        return False
    
    print("\n✓ All path tests passed successfully!")
    print("The application should be able to create and write files correctly.")
    return True

if __name__ == "__main__":
    success = test_paths()
    sys.exit(0 if success else 1) 