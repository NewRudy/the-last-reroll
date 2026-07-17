"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Reaction = "relieved" | "disappointed" | "nervous" | "reroll";
type Stage = "compose" | "rolling" | "reaction" | "reveal";

const reactionCopy: Record<Reaction, { label: string; eyebrow: string; body: string }> = {
  relieved: {
    label: "Relieved",
    eyebrow: "Relief is a signal",
    body: "The result lowered the tension. You may have been waiting for permission to choose it.",
  },
  disappointed: {
    label: "Disappointed",
    eyebrow: "Disappointment is data",
    body: "The dice landed, and part of you immediately reached for something else. That other option deserves a closer look.",
  },
  nervous: {
    label: "Nervous",
    eyebrow: "There is unfinished risk",
    body: "This result touched a real concern. The next move is not another roll—it is naming what would make this option feel safer.",
  },
  reroll: {
    label: "I want to reroll",
    eyebrow: "You wanted a different answer",
    body: "Wanting another roll often means you are not looking for randomness. You are looking for permission.",
  },
};

const pipPositions: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

function Dice({ value, active = false }: { value: number; active?: boolean }) {
  const pips = new Set(pipPositions[value] ?? pipPositions[1]);
  return (
    <div className={`dice ${active ? "dice--rolling" : ""}`} aria-label={`Dice showing ${value}`}>
      {Array.from({ length: 9 }, (_, index) => (
        <span className={pips.has(index) ? "pip pip--visible" : "pip"} key={index} />
      ))}
    </div>
  );
}

export default function Home() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [stage, setStage] = useState<Stage>("compose");
  const [dice, setDice] = useState(1);
  const [chosenIndex, setChosenIndex] = useState(0);
  const [reaction, setReaction] = useState<Reaction | null>(null);
  const [copied, setCopied] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const validOptions = useMemo(() => options.map((value) => value.trim()).filter(Boolean), [options]);
  const canRoll = question.trim().length > 4 && validOptions.length >= 2;
  const chosen = validOptions[chosenIndex] ?? "";
  const alternative = validOptions.find((_, index) => index !== chosenIndex) ?? "the other option";

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  function updateOption(index: number, value: string) {
    setOptions((current) => current.map((option, optionIndex) => (optionIndex === index ? value : option)));
  }

  function addOption() {
    if (options.length < 6) setOptions((current) => [...current, ""]);
  }

  function removeOption(index: number) {
    if (options.length > 2) setOptions((current) => current.filter((_, optionIndex) => optionIndex !== index));
  }

  function roll() {
    if (!canRoll) return;
    setStage("rolling");
    setReaction(null);
    setCopied(false);
    let ticks = 0;
    intervalRef.current = setInterval(() => {
      setDice(Math.floor(Math.random() * 6) + 1);
      ticks += 1;
      if (ticks >= 13) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        const finalRoll = Math.floor(Math.random() * 6) + 1;
        setDice(finalRoll);
        setChosenIndex((finalRoll - 1) % validOptions.length);
        window.setTimeout(() => setStage("reaction"), 420);
      }
    }, 85);
  }

  function chooseReaction(value: Reaction) {
    setReaction(value);
    setStage("reveal");
  }

  function reset() {
    setStage("compose");
    setReaction(null);
    setCopied(false);
  }

  async function shareReceipt() {
    if (!reaction) return;
    const text = `The dice chose “${chosen}.” I felt ${reactionCopy[reaction].label.toLowerCase()}. ${reactionCopy[reaction].eyebrow}.`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "My Last Reroll", text, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(text);
        setCopied(true);
      }
    } catch {
      // A dismissed share sheet needs no error state.
    }
  }

  return (
    <main>
      <nav className="nav" aria-label="Main navigation">
        <a className="brand" href="#top" aria-label="The Last Reroll home">
          <span className="brand-mark">●</span>
          THE LAST REROLL
        </a>
        <span className="nav-note">A tiny tool for stuck decisions</span>
      </nav>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="kicker">DECISION, MEET CHANCE.</p>
          <h1>The dice chooses.<br /><em>Your reaction</em> tells the truth.</h1>
          <p className="intro">
            When logic has gone in circles, let chance break the tie. The answer is not the roll—it is how you feel when it lands.
          </p>
          <div className="trust-row">
            <span>No signup</span><span>Private by design</span><span>One honest minute</span>
          </div>
        </div>

        <div className="app-shell" aria-live="polite">
          <div className="app-head">
            <span>YOUR DECISION</span>
            <span className="step-count">{stage === "compose" ? "01" : stage === "rolling" || stage === "reaction" ? "02" : "03"} / 03</span>
          </div>

          {stage === "compose" && (
            <div className="panel compose-panel">
              <label htmlFor="question">What are you deciding?</label>
              <textarea
                id="question"
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="Should I take the new job or stay where I am?"
                rows={3}
              />

              <div className="options-heading">
                <span>Your options</span>
                <span>{validOptions.length || 0} ready</span>
              </div>
              <div className="options-list">
                {options.map((option, index) => (
                  <div className="option-row" key={index}>
                    <span className="option-number">{String(index + 1).padStart(2, "0")}</span>
                    <input
                      aria-label={`Option ${index + 1}`}
                      value={option}
                      onChange={(event) => updateOption(index, event.target.value)}
                      placeholder={index === 0 ? "Take the leap" : index === 1 ? "Stay the course" : "Another path"}
                    />
                    {options.length > 2 && (
                      <button className="remove-option" onClick={() => removeOption(index)} aria-label={`Remove option ${index + 1}`}>×</button>
                    )}
                  </div>
                ))}
              </div>
              {options.length < 6 && <button className="add-option" onClick={addOption}>+ Add another option</button>}

              <button className="primary-button" disabled={!canRoll} onClick={roll}>
                <span>Roll the dice</span><span aria-hidden="true">↗</span>
              </button>
              {!canRoll && <p className="helper">Add a real question and at least two options.</p>}
            </div>
          )}

          {stage === "rolling" && (
            <div className="panel roll-panel">
              <p className="mini-label">LET CHANCE INTERRUPT THE LOOP</p>
              <Dice value={dice} active />
              <p className="rolling-copy">Rolling…</p>
            </div>
          )}

          {stage === "reaction" && (
            <div className="panel reaction-panel">
              <p className="mini-label">THE DICE CHOSE</p>
              <Dice value={dice} />
              <h2>{chosen}</h2>
              <p className="reaction-prompt">Before you explain it away—what was your first reaction?</p>
              <div className="reaction-grid">
                {(Object.keys(reactionCopy) as Reaction[]).map((key) => (
                  <button key={key} onClick={() => chooseReaction(key)}>{reactionCopy[key].label}</button>
                ))}
              </div>
            </div>
          )}

          {stage === "reveal" && reaction && (
            <div className="panel reveal-panel">
              <p className="mini-label">YOUR READ</p>
              <div className="receipt">
                <div className="receipt-row"><span>The roll</span><strong>{dice}</strong></div>
                <div className="receipt-row"><span>The choice</span><strong>{chosen}</strong></div>
                <div className="receipt-row"><span>Your reaction</span><strong>{reactionCopy[reaction].label}</strong></div>
              </div>
              <h2>{reactionCopy[reaction].eyebrow}.</h2>
              <p className="insight">{reactionCopy[reaction].body}</p>
              <div className="next-step">
                <span>TRY THIS NEXT</span>
                <p>{reaction === "relieved" ? `Live as if you chose “${chosen}” for the next 24 hours. Notice what gets lighter.` : reaction === "nervous" ? `Write down the one condition that would make “${chosen}” safer to test.` : `Give “${alternative}” a reversible 24-hour trial before making anything permanent.`}</p>
              </div>
              <div className="button-pair">
                <button className="secondary-button" onClick={reset}>Start over</button>
                <button className="primary-button share-button" onClick={shareReceipt}>{copied ? "Copied" : "Share receipt"}<span>↗</span></button>
              </div>
            </div>
          )}
        </div>
      </section>

      <footer>
        <p>Not advice. Not prophecy. Just a clearer signal from inside you.</p>
        <p>Made for the decisions that refuse to get easier.</p>
      </footer>
    </main>
  );
}
