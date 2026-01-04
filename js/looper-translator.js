let loopClasses = [];

// loopClasses
function getLoopClasses() {
    return loopClasses;
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
    };
    return text.replace(/[&<>"]/g, function(m) { return map[m]; });
}

// --- 1. DSLパーサー (ここが核心部分) ---
function parseDSL(text) {
    const lines = text.split('\n');
    const clusters = {}; // ループごとのデータ格納庫
    let currentLoop = "Default"; // デフォルトのグループ名

    lines.forEach(line => {
        let cleanLine = line.trim();
        if (!cleanLine) return;

        // コメント除去
        let comment = "";
        if (cleanLine.includes("//")) {
            const parts = cleanLine.split("//");
            cleanLine = parts[0].trim();
        }

        // Loop定義の判定: "Loop: タイトル"
        if (cleanLine.match(/^Loop:/i)) {
            currentLoop = cleanLine.replace(/^Loop:/i, '').trim();
            return;
        }

        // 矢印定義の判定: "A -> B (+) :explain" または "A -> B (+) delay :explain"
        // 正規表現解説:
        // 1. (.+?)   -> A (始点)
        // 2. ->      -> 矢印
        // 3. (.+?)   -> B (終点)
        // 4. (?:\((.+?)\))? -> 極性 (+ or -) (任意)
        // 5. (delay)? -> 遅延オプション (任意)
        // 6. (?::(.*))? -> 説明 (任意、: で始まる、空文字列も許可)
        const match = cleanLine.match(/^(.+?)\s*->\s*(.+?)(?:\s*\((.+?)\))?\s*(delay)?(?:\s*:(.*))?$/);

        if (match) {
            if (!clusters[currentLoop]) clusters[currentLoop] = [];

            clusters[currentLoop].push({
                from: match[1].trim(),
                to: match[2].trim(),
                polarity: match[3] ? match[3].trim() : "", // デフォルトは中立（空文字列）
                hasDelay: !!match[4], // delayがあればtrue
                explain: match[5] ? match[5].trim() : ""
            });
        }
    });
    return clusters;
}

// --- 2. DOT言語への変換 ---
function generateDOT(clusters) {
    let dot = `digraph DSL_Graph {
        graph [fontname="Meiryo, sans-serif", rankdir=TB];
        node [fontname="Meiryo, sans-serif", shape=ellipse, style=filled, fillcolor=white, color="#333333"];
        edge [fontname="Meiryo, sans-serif", fontsize=10, penwidth=1.5];
    `;

    loopClasses = [];
    Object.keys(clusters).forEach((loopName, index) => {
        if (loopName !== "Default") {
            loopClasses[index] = escapeHtml(loopName);
        }

        clusters[loopName].forEach(edge => {
            // 色の決定 (正:青, 逆:赤)
            const isPositive = edge.polarity.includes("+");
            const isNegative = edge.polarity.includes("-");
            const color = isPositive ? "#1976D2" : isNegative ? "#D32F2F" : "#000";
            const labelColor = isPositive ? "#1976D2" : isNegative ? "#D32F2F" : "#000"; // ラベル色も合わせる
            // ラベルの作成 (極性 + 説明 + 遅延)
            let label = edge.polarity ? `(${edge.polarity})` : "";
            if (edge.explain) label += (label ? "\\n" : "") + edge.explain;
            if (edge.hasDelay) label += "\\n⌛";

            // スタイルの決定 (遅延なら点線)
            const style = edge.hasDelay ? "dashed" : "solid";

            dot += `    "${edge.from}" -> "${edge.to}" [
                label="${label}",
                color="${color}",
                fontcolor="${labelColor}",
                style="${style}"
                class="edge${index}"
            ];\n`;
        });

        if (loopName !== "Default") {
            dot += `    \n`;
        }
    });

    dot += `}`;
    return dot;
}
