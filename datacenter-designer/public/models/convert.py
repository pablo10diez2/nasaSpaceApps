# Usage: python convert.py input.obj output.obj
# This script shifts all vertices so the minimum X and minimum Y are at 0 (not centered).

import sys

def shift_obj_min_xy(input_path, output_path):
    vertices = []
    with open(input_path, "r") as f:
        for line in f:
            if line.startswith("v "):
                parts = line.strip().split()
                x, y, z = map(float, parts[1:4])
                vertices.append([x, y, z])

    if not vertices:
        print("No vertices found.")
        return

    min_x = min(v[0] for v in vertices)
    min_y = min(v[1] for v in vertices)

    # Write output
    v_idx = 0
    with open(output_path, "w") as f_out, open(input_path, "r") as f_in:
        for line in f_in:
            if line.startswith("v "):
                x, y, z = vertices[v_idx]
                x -= min_x
                y -= min_y
                f_out.write(f"v {x:.8f} {y:.8f} {z:.8f}\n")
                v_idx += 1
            else:
                f_out.write(line)

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python convert.py input.obj output.obj")
        sys.exit(1)
    shift_obj_min_xy(sys.argv[1], sys.argv[2])