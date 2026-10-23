/* ============================================================
   focus.js  --  2D fokus-model.
   Holder styr paa (raekke, kolonne) som rene tal. Rører IKKE
   DOM under navigation -- kun naar fokus faktisk flytter sig.
   Det er hele grunden til at det foeles hurtigt paa en svag SoC.
   ============================================================ */

function Grid(rows) {
  this.rows = rows;      // [[item, item, ...], ...]
  this.r = 0;
  this.c = 0;
}

Grid.prototype.current = function () {
  var row = this.rows[this.r];
  if (!row || !row.length) return null;
  return row[Math.min(this.c, row.length - 1)];
};

/* Returnerer true hvis fokus flyttede sig. */
Grid.prototype.move = function (dr, dc) {
  var oldR = this.r, oldC = this.c;

  if (dr !== 0) {
    var nr = this.r + dr;
    if (nr >= 0 && nr < this.rows.length) {
      if (this.rows[nr] && this.rows[nr].length) {
        this.r = nr;
        // Behold kolonne, men klem til raekkens laengde.
        this.c = Math.min(this.c, this.rows[nr].length - 1);
      }
    }
  }

  if (dc !== 0) {
    var row = this.rows[this.r];
    if (row && row.length) {
      var nc = this.c + dc;
      if (nc >= 0 && nc < row.length) this.c = nc;
    }
  }

  return this.r !== oldR || this.c !== oldC;
};

/* Sæt fokus tilbage til förste felt. */
Grid.prototype.reset = function () {
  this.r = 0;
  this.c = 0;
};
