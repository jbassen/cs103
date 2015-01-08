var testProof =
    "// This is not so easy to see\n" +
    "P1: proof\n" +
    "C1:    P and (P or Q) <=> (P or \F) and (P or Q) by orIdentity\n" +
    "                      <=>  P or (\F and Q) by distribOrAnd\n" +
    "		      <=> P or \F by andDomination\n" +
    "		      <=> P by orIdentity\n" +
    "end\n";
