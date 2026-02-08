"""
Validate sovereign stack setup
"""

import os
import sys
from pathlib import Path

def test_mem0_setup():
    """Test mem0 memory layer"""
    print("🧪 Testing mem0 memory layer...")
    
    try:
        from mem0 import Memory
        
        memory = Memory(config={
            "vector_store": {
                "provider": "lancedb",
                "config": {"uri": "C:\\BUENATURA\\mem0\\vectors\\lance"}
            }
        })
        
        memory.add(
            messages=[{
                "role": "user",
                "content": "Valentin Kranz empowers purpose-driven leaders at BUENATURA"
            }],
            user_id="valentin"
        )
        
        results = memory.search(
            query="Who is Valentin?",
            user_id="valentin"
        )
        
        print(f"✅ mem0 working - Found {len(results['results'])} memories")
        print(f"   Sample: {results['results'][0]['memory']}")
        return True
    except Exception as e:
        print(f"❌ mem0 test failed: {e}")
        return False

def test_directories():
    """Test directory structure"""
    print("\n📁 Testing directories...")
    
    required_dirs = [
        "C:\\BUENATURA\\mem0\\vectors",
        "C:\\BUENATURA\\knowledge",
        "C:\\BUENATURA\\mcp",
        "C:\\BUENATURA\\logs"
    ]
    
    all_exist = True
    for dir_path in required_dirs:
        exists = Path(dir_path).exists()
        status = "✅" if exists else "❌"
        print(f"{status} {dir_path}")
        all_exist = all_exist and exists
    
    return all_exist

def test_python_packages():
    """Test required packages"""
    print("\n📦 Testing Python packages...")
    
    packages = [
        "mem0",
        "lancedb",
        "sentence_transformers",
        "langchain_anthropic",
        "dotenv"
    ]
    
    all_installed = True
    for package in packages:
        try:
            __import__(package)
            print(f"✅ {package}")
        except ImportError:
            print(f"❌ {package} not found")
            all_installed = False
    
    return all_installed

def test_env_file():
    """Test environment configuration"""
    print("\n⚙️ Testing environment configuration...")
    
    env_path = Path("C:\\BUENATURA\\.env")
    if not env_path.exists():
        print("❌ .env file not found")
        return False
    
    print("✅ .env file exists")
    return True

def main():
    print("🚀 Sovereign RAG Stack - Setup Validation\n")
    print("=" * 50)
    
    tests = [
        ("Directories", test_directories),
        ("Python Packages", test_python_packages),
        ("Environment Config", test_env_file),
        ("mem0 Memory Layer", test_mem0_setup)
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"\n❌ {test_name} failed with error: {e}")
            results.append((test_name, False))
    
    print("\n" + "=" * 50)
    print("\n📊 Summary:\n")
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {test_name}")
    
    all_passed = all(result for _, result in results)
    
    if all_passed:
        print("\n🎉 All tests passed! Ready to use.")
        return 0
    else:
        print("\n⚠️ Some tests failed. Please review above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
