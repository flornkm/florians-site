"""Subset Ciron variable trial font to the upright 'Text' flavor and remap its
non-standard wght axis (25-280) onto a conventional 100-900 scale, then emit woff2.

Master alignment (original Text-flavor wght -> new label):
  Hairline 25 -> 100   Extralight 48 -> 200   Light 67 -> 300   Regular 90 -> 400
  Medium 118 -> 500    Bold 149 -> 700        Extrabold 183 -> 800   Super 280 -> 900
"""
import os
from fontTools.ttLib import TTFont, newTable
from fontTools.ttLib.tables._f_v_a_r import NamedInstance
from fontTools.varLib.instancer import instantiateVariableFont

SRC = "CironVariableUnlicensedTrialVersion-CironVariable.ttf"
OUT_TTF = "CironText-VF.ttf"
OUT_WOFF = "CironText-VF.woff"
OUT_WOFF2 = "CironText-VF.woff2"

ft = TTFont(SRC)

# 1) Keep only the Text flavor (FLVR=0), upright (ital=0). Drops those two axes.
instantiateVariableFont(ft, {"FLVR": 0, "ital": 0}, inplace=True)

# 2) Rebase the default instance to Regular (wght 90) so the new default = 400.
instantiateVariableFont(ft, {"wght": (25, 90, 280)}, inplace=True)
assert "avar" not in ft, "instancer unexpectedly added an avar; remap math assumes none"

# Old normalized coords (after rebasing: min=25, default=90, max=280)
def old_norm(v):
    return (v - 90) / (90 - 25) if v <= 90 else (v - 90) / (280 - 90)

# New normalized coords (min=100, default=400, max=900)
def new_norm(v):
    return (v - 400) / (400 - 100) if v <= 400 else (v - 400) / (900 - 400)

# master old-wght -> new label
PAIRS = [(25, 100), (48, 200), (67, 300), (90, 400),
         (118, 500), (149, 700), (183, 800), (280, 900)]

# 3) New fvar axis + avar segment map (new normalized -> old normalized)
axis = ft["fvar"].axes[0]
axis.minValue, axis.defaultValue, axis.maxValue = 100, 400, 900

seg = {round(new_norm(nw), 5): round(old_norm(ow), 5) for ow, nw in PAIRS}
seg[-1.0] = -1.0
seg[0.0] = 0.0
seg[1.0] = 1.0
avar = newTable("avar")
avar.segments = {"wght": dict(sorted(seg.items()))}
ft["avar"] = avar

# Rebuild named instances on the new scale with fresh name records.
NAMES = [(100, "Thin"), (200, "ExtraLight"), (300, "Light"), (400, "Regular"),
         (500, "Medium"), (600, "SemiBold"), (700, "Bold"), (800, "ExtraBold"), (900, "Black")]
name = ft["name"]
nid = 256
instances = []
for wght, label in NAMES:
    name.setName(label, nid, 3, 1, 0x409)
    inst = NamedInstance()
    inst.subfamilyNameID = nid
    inst.coordinates = {"wght": wght}
    instances.append(inst)
    nid += 1
ft["fvar"].instances = instances

# Family naming + default weight class.
for fid in (1, 16):
    name.setName("Ciron Text", fid, 3, 1, 0x409)
for fid in (2, 17):
    name.setName("Regular", fid, 3, 1, 0x409)
name.setName("Ciron Text", 4, 3, 1, 0x409)
name.setName("CironText-Regular", 6, 3, 1, 0x409)
ft["OS/2"].usWeightClass = 400
if "STAT" in ft:
    del ft["STAT"]  # stale axis values; optional for web, drop to avoid inconsistency

ft.save(OUT_TTF)
ft.flavor = "woff"
ft.save(OUT_WOFF)
ft.flavor = "woff2"
ft.save(OUT_WOFF2)

print("axis:", axis.minValue, axis.defaultValue, axis.maxValue)
print("avar wght:", ft["avar"].segments["wght"])
for f in (SRC, OUT_TTF, OUT_WOFF, OUT_WOFF2):
    print(f"  {f}: {os.path.getsize(f) / 1024:.1f} KB")
