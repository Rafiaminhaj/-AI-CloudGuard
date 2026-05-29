import math
import re

# Mock Knowledge Base (Playbook)
KNOWLEDGE_BASE = [
    {
        "id": "doc1",
        "title": "DDoS Mitigation Playbook",
        "content": "If a DDoS attack is detected (volumetric spikes on port 80/443), immediately scale the frontend Kubernetes pods and route traffic through the cloud WAF. Apply rate limiting of 100 req/sec per IP."
    },
    {
        "id": "doc2",
        "title": "Malware Outbreak Procedures",
        "content": "When anomalous executable behavior is found, isolate the affected node from the VPC. Dump memory for forensics using Volatility. Do not restart the node to preserve volatile memory."
    },
    {
        "id": "doc3",
        "title": "Zero-Day Exploit Handling",
        "content": "Zero-days usually bypass signature detection. Rely on heuristic anomalies. Disconnect affected database instances immediately. Switch to read-only replicas in isolated subnet."
    }
]

def cosine_similarity(v1, v2):
    dot_product = sum(a * b for a, b in zip(v1, v2))
    magnitude1 = math.sqrt(sum(a * a for a in v1))
    magnitude2 = math.sqrt(sum(b * b for b in v2))
    if not magnitude1 or not magnitude2:
        return 0
    return dot_product / (magnitude1 * magnitude2)

def text_to_vector(text, vocab):
    words = re.findall(r'\w+', text.lower())
    return [words.count(word) for word in vocab]

def rag_query(user_query):
    # 1. Build Vocabulary
    corpus = " ".join([doc['content'] for doc in KNOWLEDGE_BASE]) + " " + user_query
    vocab = list(set(re.findall(r'\w+', corpus.lower())))

    # 2. Vectorize Query
    query_vector = text_to_vector(user_query, vocab)

    # 3. Vectorize Docs and Find Best Match (Simulating FAISS/ChromaDB)
    best_doc = None
    highest_score = -1

    for doc in KNOWLEDGE_BASE:
        doc_vector = text_to_vector(doc['content'], vocab)
        score = cosine_similarity(query_vector, doc_vector)
        if score > highest_score:
            highest_score = score
            best_doc = doc

    # 4. Generate Augmented Response
    if highest_score > 0.1:
        return f"[RAG Augmented Context: {best_doc['title']}] Based on internal policies: {best_doc['content']}"
    else:
        return "I could not find relevant playbooks in our Vector Database for that query. Defaulting to general heuristic advice."
