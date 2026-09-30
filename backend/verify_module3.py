import urllib.request
import json

payload = [
    {
        "id": "doc_1",
        "subject": "Linear Algebra",
        "chapter": "Matrix Transformations",
        "text": (
            "A vector is an ordered collection of numbers representing a point or direction. "
            "A matrix is a rectangular array of numbers arranged in rows and columns. "
            "Matrix multiplication is an algebraic operation used to combine matrices. "
            "A linear transformation is a mapping between vector spaces that preserves vector addition and scalar multiplication. "
            "Eigenvalues and eigenvectors represent invariant scaling directions under transformations."
        )
    },
    {
        "id": "doc_2",
        "subject": "Neural Networks",
        "chapter": "Forward Propagation and Layers",
        "text": (
            "A neuron is a fundamental processing unit that receives inputs and applies synaptic weights. "
            "A neural network layer consists of multiple neurons operating in parallel. "
            "Forward propagation is the process of transmitting activations through successive layers to compute output predictions. "
            "Weight matrices contain learnable parameters that define layer transformations."
        )
    }
]

req = urllib.request.Request(
    'http://127.0.0.1:8000/api/extract-concepts',
    data=json.dumps(payload).encode('utf-8'),
    headers={'Content-Type': 'application/json'}
)

with urllib.request.urlopen(req) as resp:
    print("HTTP Status:", resp.status)
    data = json.loads(resp.read().decode('utf-8'))
    print("Extraction Success:", data.get("success"))
    print("Total Concepts Found:", data.get("total_concepts"))
    print("\nExtracted Concepts Breakdown:")
    for c in data.get("concepts", []):
        print(f"  • [{c['subject']}] {c['name']} (Type: {c['type']}, Importance: {c['importance']})")
        print(f"    Definition: {c['description']}")
        print(f"    ID: {c['id']}")
