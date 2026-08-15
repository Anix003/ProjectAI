import math
import re
import logging
from typing import List, Dict, Tuple, Any

logger = logging.getLogger(__name__)

def tokenize(text: str) -> List[str]:
  if not text:
    return []
  # Strip punctuation and split by whitespace
  text = re.sub(r'[^\w\s]', '', text.lower())
  return text.split()

class SimpleTFIDF:
  def __init__(self, corpus: List[str]):
    self.corpus_size = len(corpus)
    self.df = {}
    for doc in corpus:
      words = set(tokenize(doc))
      for w in words:
        self.df[w] = self.df.get(w, 0) + 1
    
    self.idf = {}
    for w, count in self.df.items():
      # Standard smooth IDF formula
      self.idf[w] = math.log((1 + self.corpus_size) / (1 + count)) + 1

  def get_vector(self, text: str) -> Dict[str, float]:
    tokens = tokenize(text)
    tf = {}
    for t in tokens:
      tf[t] = tf.get(t, 0) + 1
        
    vector = {}
    length_sq = 0.0
    for w, count in tf.items():
      if w in self.idf:
        val = count * self.idf[w]
        vector[w] = val
        length_sq += val * val
            
    length = math.sqrt(length_sq)
    if length > 0:
      for w in vector:
        vector[w] /= length
    return vector

def calculate_cosine_similarity(v1: Dict[str, float], v2: Dict[str, float]) -> float:
  score = 0.0
  for w in v1:
    if w in v2:
      score += v1[w] * v2[w]
  return score

def check_for_duplicates(
  new_title: str, 
  new_desc: str, 
  existing_complaints: List[Dict[str, Any]], 
  threshold: float = 0.55
) -> Tuple[bool, str]:
  """
  Checks if a new complaint is a duplicate of any existing complaints in the list.
  Returns a tuple: (is_duplicate, duplicate_complaint_id)
  """
  if not existing_complaints:
    return False, ""

  # Create corpus of title + description
  corpus = []
  for c in existing_complaints:
    title = c.get("complaint_title", "")
    desc = c.get("original_text", "")
    corpus.append(f"{title} {desc}")

  try:
    tfidf = SimpleTFIDF(corpus)
    new_text = f"{new_title} {new_desc}"
    new_vector = tfidf.get_vector(new_text)

    max_sim = 0.0
    duplicate_id = ""

    for idx, c in enumerate(existing_complaints):
      doc_text = corpus[idx]
      doc_vector = tfidf.get_vector(doc_text)
      sim = calculate_cosine_similarity(new_vector, doc_vector)
      
      if sim > max_sim:
        max_sim = sim
        duplicate_id = c.get("$id") or c.get("id_complaint") or ""

    logger.info(f"Duplicate check: Max similarity is {max_sim:.2f} (Threshold: {threshold})")

    if max_sim >= threshold:
      return True, duplicate_id

  except Exception as e:
    logger.error(f"Error during duplicate detection: {e}")

  return False, ""
