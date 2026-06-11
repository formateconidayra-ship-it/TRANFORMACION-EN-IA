import json
from pathlib import Path

analysis = json.loads(Path("graphify-out/.graphify_analysis.json").read_text(encoding="utf-8"))
communities = analysis["communities"]
for cid, nodes in sorted(communities.items(), key=lambda x: int(x[0])):
    print("Community {}: {} nodes - {}".format(cid, len(nodes), ", ".join(nodes[:5])))
