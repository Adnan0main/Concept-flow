import urllib.request
import json
import sys

# Ensure UTF-8 output on Windows stdout
sys.stdout.reconfigure(encoding='utf-8')

sample_documents = [
    {
        "id": "doc_1",
        "subject": "Linear Algebra",
        "chapter": "Matrix Transformations",
        "text": (
            "A vector is an ordered sequence of numbers representing a point or direction in vector space. "
            "A matrix is a rectangular array of numbers arranged in rows and columns used to represent linear maps. "
            "Matrix multiplication is an algebraic operation where two matrices are combined to produce a third matrix: C = A * B. "
            "A linear transformation is a function T(v) between vector spaces that preserves vector addition and scalar multiplication: T(u + v) = T(u) + T(v). "
            "Eigenvalues and eigenvectors satisfy the characteristic equation A*v = lambda*v and determine invariant directional axes."
        )
    },
    {
        "id": "doc_2",
        "subject": "Neural Networks",
        "chapter": "Forward Propagation and Layers",
        "text": (
            "An artificial neuron is a computational unit that computes a weighted sum of its inputs and applies a non-linear activation function. "
            "A neural network layer consists of an array of parallel neurons whose connection strengths are structured as a weight matrix. "
            "Forward propagation is the algorithmic pass where input feature vectors are transformed through successive layers to compute predictions: y_hat = f(W*x + b). "
            "Activation functions like ReLU or Sigmoid introduce non-linearity into network transformations. "
            "A loss function measures the discrepancy between predicted outputs and ground truth labels."
        )
    }
]

def test_full_pipeline():
    print("=================================================================")
    print("ConceptFlow Verification: Modules 3, 4, 5 & Knowledge Graph Pipeline")
    print("=================================================================")

    # Test 1: Health & Status
    try:
        req = urllib.request.Request('http://127.0.0.1:8000/api/status')
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            print("\n[OK] Backend Status:", data.get("status"))
            print("  Active Modules:", len(data.get("modules_active", [])))
            for m in data.get("modules_active", []):
                print(f"    - {m}")
    except Exception as e:
        print(f"[FAIL] Could not connect to backend status endpoint: {e}")
        return

    # Test 2: Module 3 - Concept Extraction
    print("\n-----------------------------------------------------------------")
    print("Testing Module 3: Concept Extraction Endpoint (/api/extract-concepts)")
    print("-----------------------------------------------------------------")
    req = urllib.request.Request(
        'http://127.0.0.1:8000/api/extract-concepts',
        data=json.dumps(sample_documents).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode('utf-8'))
        print(f"[OK] Extracted {res['total_concepts']} concepts across {len(sample_documents)} documents.")
        concepts = res.get("concepts", [])
        for c in concepts:
            print(f"  * [{c['subject']}] {c['name']} (ID: {c['id']}, Type: {c['type']}, Importance: {c['importance']})")

    # Test 3: Module 4 - Intra-Disciplinary Relationships
    print("\n-----------------------------------------------------------------")
    print("Testing Module 4: Intra-Disciplinary Relationships (/api/extract-intra-relationships)")
    print("-----------------------------------------------------------------")
    req = urllib.request.Request(
        'http://127.0.0.1:8000/api/extract-intra-relationships',
        data=json.dumps({"documents": sample_documents, "concepts": concepts}).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode('utf-8'))
        intra_rels = res.get("relationships", [])
        print(f"[OK] Extracted {len(intra_rels)} intra-disciplinary relationships:")
        for r in intra_rels:
            print(f"  * {r['source']} --[{r['label']}]--> {r['target']} (Scope: {r['scope']}, Type: {r['evidence_type']})")
            print(f"    Reasoning: {r['explanation']}")

    # Test 4: Module 5 - Cross-Disciplinary Inference (Surprise Challenge)
    print("\n-----------------------------------------------------------------")
    print("Testing Module 5: Cross-Disciplinary Inference (/api/infer-cross-disciplinary)")
    print("-----------------------------------------------------------------")
    req = urllib.request.Request(
        'http://127.0.0.1:8000/api/infer-cross-disciplinary',
        data=json.dumps({"documents": sample_documents, "concepts": concepts}).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode('utf-8'))
        cross_rels = res.get("relationships", [])
        print(f"[OK] Discovered {len(cross_rels)} cross-disciplinary conceptual bridges:")
        for r in cross_rels:
            print(f"  [CROSS-BRIDGE] {r['source']} --[{r['label']}]--> {r['target']} (Confidence: {r['confidence']})")
            print(f"    Bridge Explanation: {r['explanation']}")
            print(f"    Evidence: {r['evidence']}")

    # Test 5: Full Knowledge Graph Assembly (/api/generate-graph)
    print("\n-----------------------------------------------------------------")
    print("Testing End-to-End Synthesis: Knowledge Graph Endpoint (/api/generate-graph)")
    print("-----------------------------------------------------------------")
    req = urllib.request.Request(
        'http://127.0.0.1:8000/api/generate-graph',
        data=json.dumps({"documents": sample_documents}).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    with urllib.request.urlopen(req) as resp:
        graph = json.loads(resp.read().decode('utf-8'))
        print(f"[OK] Knowledge Graph Synthesized:")
        print(f"  Title: {graph['title']}")
        print(f"  Summary: {graph['summary']}")
        print(f"  Stats: {graph['stats']}")
        print(f"  Total Nodes: {len(graph['nodes'])}")
        print(f"  Total Relationships: {len(graph['relationships'])}")

if __name__ == "__main__":
    test_full_pipeline()
