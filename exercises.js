{
  _id: 3,
  type: "proofchecker",
  checker: "propositionalIdentityMode",
  name: "1a",
  problemJSON: "{\"instructions\":\"// Do an equational proof of the following identity.\\n// This is an important property of \\\"implies\\\".\\n// Think about whether it makes intuitive sense.\\n// P -> (Q -> R) <=> (P and Q) -> R\\n\\nP1: proof\\nC1:  // fill in your answer here\\nend\\n\",\"formula\":\"P -> (Q -> R) <=> (P and Q) -> R\"}",
  __v: 0
}
{
  _id: 4,
  type: "proofchecker",
  checker: "propositionalIdentityMode",
  name: "1b",
  problemJSON: "{\"instructions\":\"// Please do an equational proof of the following identity.\\n// This is a way to convert the biconditional to AND/OR/NOT.\\n// Think about why it intuitively makes sense.\\n// P <-> Q <=> (not P or Q) and (not Q or P)\\n\\nP1: proof\\nC1:  // fill in your answer here\\nend\\n\",\"formula\":\"P <-> Q <=> (not P or Q) and (not Q or P)\"}",
  __v: 0
}
{
  _id: 5,
  type: "proofchecker",
  checker: "propositionalIdentityMode",
  name: "1c",
  problemJSON: "{\"instructions\":\"// Please do an equational proof of the following identity.\\n// This is a different way to convert the biconditional to\\n// AND/OR/NOT.  Surprisingly, the result is completely different\\n// (e.g., \\\"and\\\" and \\\"or\\\" are swapped), but about the same size\\n// as the solution to the previous problem.\\n// Think about why it intuitively makes sense.\\n// P <-> Q <=> (P and Q) or (not P and not Q)\\n\\n// NOTE: There was a problem with the distributive rule that\\n// it couldn't check this.  You can work on this an check (and save)\\n// it, but we have to fix the distributive rule before it will fully\\n// check.  We'll make an announcement and remove this message when\\n// the problem is resolved.\\n\\nP1: proof\\nC1:  // fill in your answer here\\nend\\n\",\"formula\":\"P <-> Q <=> (P and Q) or (not P and not Q)\"}",
  __v: 0
}
{
  _id: 6,
  type: "proofchecker",
  checker: "propositionalIdentityMode",
  name: "1d",
  problemJSON: "{\"instructions\":\"// Please prove the following identity about biconditionals.\\n// There is no rule for contrapositive, so you will need to\\n// use other rules (but see the contrapositive example).\\n// P <-> Q <=>  not P <-> not Q\\nP1: proof\\nC1:  // fill in your answer here.\\nend\\n\",\"formula\":\"P <-> Q <=>  not P <-> not Q\"}",
  __v: 0
}
{
  _id: 7,
  type: "proofchecker",
  checker: "folIdentityMode",
  name: "useless quantifiers",
  problemJSON: "{\"instructions\":\"// useless quantifiers\\n// prove the following identity:\\n// \\\\exists x: P <=> \\\\forall x: P\\n\\nP1: proof\\nC1:  // fill in your answer here\\nend\\n\",\"formula\":\"\\\\exists x: P <=> \\\\forall x: P\"}",
  __v: 0
}
{
  _id: 8,
  type: "proofchecker",
  checker: "folIdentityMode",
  name: "\"distributing\" exists over implies",
  problemJSON: "{\"instructions\":\"// \\\"distributing\\\" exists over implies\\n// prove the following identity:\\n// \\\\exists x: (P(x) -> Q(x)) <=> (\\\\forall x: P(x)) -> (\\\\exists x: Q(x))\\n\\nP1: proof\\nC1:  // fill in your answer here\\nend\\n\",\"formula\":\"\\\\exists x: (P(x) -> Q(x)) <=> (\\\\forall x: P(x)) -> (\\\\exists x: Q(x))\"}",
  __v: 0
}
{
  _id: 9,
  type: "proofchecker",
  checker: "folIdentityMode",
  name: "moving quantifiers to the front",
  problemJSON: "{\"instructions\":\"// moving quantifiers to the front\\n// prove the following identity:\\n// \\\\forall x: ((not \\\\forall y: P(y)) or Q(x)) and \\\\forall x: R(x) <=> \\\\forall x: \\\\exists y: ((not P(y) or Q(x)) and R(x))\\n\\nP1: proof\\nC1:  // fill in your answer here\\nend\\n\",\"formula\":\"\\\\forall x: ((not \\\\forall y: P(y)) or Q(x)) and \\\\forall x: R(x) <=> \\\\forall x: \\\\exists y: ((not P(y) or Q(x)) and R(x))\"}",
  __v: 0
}
{
  _id: 10,
  type: "proofchecker",
  checker: "folIdentityMode",
  name: "a non-obvious tautolog",
  problemJSON: "{\"instructions\":\"// a non-obvious tautology\\n// prove the following identity:\\n// \\\\exists x: (P(x) -> (\\\\forall y: P(y))) <=> T\\n\\nP1: proof\\nC1:  // fill in your answer here\\nend\\n\",\"formula\":\"\\\\exists x: (P(x) -> (\\\\forall y: P(y))) <=> T\"}",
  __v: 0
}
{
  _id: 11,
  type: "proofchecker",
  checker: "folIdentityMode",
  name: "combining implications",
  problemJSON: "{\"instructions\":\"// combining implications\\n// prove the following identity:\\n// \\\\forall x : (P(x) -> Q(x)) and \\\\forall y: (P(y) \\\\implies R(y)) <=> \\\\forall x: (P(x) -> Q(x) and R(x))\\n\\nP1: proof\\nC1:  // fill in your answer here\\nend\\n\",\"formula\":\"\\\\forall x : (P(x) -> Q(x)) and \\\\forall y: (P(y) \\\\implies R(y)) <=> \\\\forall x: (P(x) -> Q(x) and R(x))\"}",
  __v: 0
}
