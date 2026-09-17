import { WorkspaceTemplate } from "./types";

export const templates: WorkspaceTemplate[] = [
  {
    id: "html-web",
    name: "Web App (HTML/CSS/JS)",
    description: "Full-featured, diversified client-side web sandbox with modular components and live preview.",
    icon: "Globe",
    files: [
      {
        path: "index.html",
        language: "html",
        content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Diversified Workspace App</title>
    <link rel="stylesheet" href="styles.css">
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex flex-col font-sans antialiased">
    <!-- Header Navigation -->
    <header class="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 px-6 py-3 flex items-center justify-between">
        <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-500/20">⚡</div>
            <h1 class="text-base font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">Diversified Studio Sandbox</h1>
        </div>
        <div class="flex items-center gap-2 text-xs font-mono">
            <span class="px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Sandbox Ready
            </span>
            <span id="time-display" class="text-slate-400 hidden sm:inline"></span>
        </div>
    </header>

    <!-- Main Container -->
    <main class="flex-1 max-w-6xl w-full mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Sidebar Controls & Metrics -->
        <section class="space-y-6">
            <div class="card p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
                <h2 class="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center justify-between">
                    <span>⚡ Quick Controls</span>
                    <span class="text-xs text-indigo-400 font-normal">Interactive</span>
                </h2>
                <div class="space-y-4">
                    <button id="counter-btn" class="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold py-2.5 px-4 rounded-xl shadow-lg shadow-indigo-600/25 transition-all duration-150 transform active:scale-95 flex items-center justify-between">
                        <span>Increment State</span>
                        <span id="count" class="bg-white/20 px-2 py-0.5 rounded-md font-mono text-xs">0</span>
                    </button>
                    <button id="theme-toggle" class="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium py-2 px-4 rounded-xl border border-slate-700 text-xs transition-colors flex items-center justify-between">
                        <span>Toggle Palette Theme</span>
                        <span id="current-theme" class="text-slate-400 font-mono">Dark Neon</span>
                    </button>
                </div>
            </div>

            <div class="card p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
                <h2 class="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3">📁 Module Status</h2>
                <ul id="module-list" class="space-y-2 text-xs font-mono text-slate-400">
                    <li class="p-2 rounded bg-slate-950 border border-slate-800 flex justify-between">
                        <span>components/dashboard.js</span>
                        <span class="text-indigo-400 font-bold">Active</span>
                    </li>
                    <li class="p-2 rounded bg-slate-950 border border-slate-800 flex justify-between">
                        <span>utils/helpers.js</span>
                        <span class="text-emerald-400 font-bold">Loaded</span>
                    </li>
                    <li class="p-2 rounded bg-slate-950 border border-slate-800 flex justify-between">
                        <span>data/sampleData.json</span>
                        <span class="text-purple-400 font-bold">Synced</span>
                    </li>
                </ul>
            </div>
        </section>

        <!-- Main Dynamic Content -->
        <section class="md:col-span-2 space-y-6">
            <!-- Dynamic Dashboard Mounting Target -->
            <div id="dashboard-target" class="card p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
                <div class="animate-pulse space-y-4">
                    <div class="h-6 bg-slate-800 rounded w-1/3"></div>
                    <div class="h-32 bg-slate-800/50 rounded-xl"></div>
                </div>
            </div>

            <!-- Dynamic Analytics Target -->
            <div id="analytics-target" class="card p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
                <div class="animate-pulse space-y-4">
                    <div class="h-6 bg-slate-800 rounded w-1/4"></div>
                    <div class="h-24 bg-slate-800/50 rounded-xl"></div>
                </div>
            </div>
        </section>
    </main>

    <!-- Footer -->
    <footer class="border-t border-slate-800 py-4 px-6 text-center text-xs text-slate-500 font-mono">
        Diversified Multi-Module Workspace • Powered by Agent Core
    </footer>

    <!-- Modular Script Imports -->
    <script type="module" src="script.js"></script>
</body>
</html>`
      },
      {
        path: "styles.css",
        language: "css",
        content: `/* Custom CSS Enhancements & Color Variables */
:root {
  --primary-glow: #6366f1;
  --secondary-glow: #a855f7;
  --card-bg: rgba(15, 23, 42, 0.8);
}

body.light-mode {
  background-color: #f8fafc;
  color: #0f172a;
}

body.light-mode header {
  background-color: rgba(255, 255, 255, 0.9);
  border-color: #e2e8f0;
}

body.light-mode .card {
  background-color: #ffffff;
  border-color: #e2e8f0;
  color: #1e293b;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
}

.glow-card {
  transition: all 0.25s ease-in-out;
}

.glow-card:hover {
  border-color: rgba(99, 102, 241, 0.4);
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.15);
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: #090d16;
}
::-webkit-scrollbar-thumb {
  background: #1e293b;
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: #334155;
}`
      },
      {
        path: "script.js",
        language: "javascript",
        content: `import { renderDashboard } from './components/dashboard.js';
import { renderAnalytics } from './components/analytics.js';
import { formatTime, getStoredState, saveStoredState } from './utils/helpers.js';

// Application State Store
let appState = {
  clickCount: getStoredState('count') || 0,
  theme: getStoredState('theme') || 'dark'
};

// Main DOM Elements
const counterBtn = document.getElementById('counter-btn');
const countSpan = document.getElementById('count');
const timeDisplay = document.getElementById('time-display');
const themeToggleBtn = document.getElementById('theme-toggle');
const currentThemeLabel = document.getElementById('current-theme');

// Initialize State and Render Components
function initApp() {
  countSpan.textContent = appState.clickCount;
  
  if (appState.theme === 'light') {
    document.body.classList.add('light-mode');
    currentThemeLabel.textContent = 'Light Glass';
  }

  // Update Clock Timer
  setInterval(() => {
    if (timeDisplay) {
      timeDisplay.textContent = formatTime(new Date());
    }
  }, 1000);

  // Counter Listener
  if (counterBtn) {
    counterBtn.addEventListener('click', () => {
      appState.clickCount++;
      countSpan.textContent = appState.clickCount;
      saveStoredState('count', appState.clickCount);
      
      // Notify components of updated metrics
      renderDashboard(appState.clickCount);
    });
  }

  // Theme Listener
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      appState.theme = appState.theme === 'dark' ? 'light' : 'dark';
      document.body.classList.toggle('light-mode');
      currentThemeLabel.textContent = appState.theme === 'dark' ? 'Dark Neon' : 'Light Glass';
      saveStoredState('theme', appState.theme);
    });
  }

  // Load Sub-components
  renderDashboard(appState.clickCount);
  renderAnalytics();
}

document.addEventListener('DOMContentLoaded', initApp);`
      },
      {
        path: "components/dashboard.js",
        language: "javascript",
        content: `// Modular Dashboard Component
import sampleData from '../data/sampleData.json' assert { type: 'json' };

export function renderDashboard(clickMultiplier = 0) {
  const target = document.getElementById('dashboard-target');
  if (!target) return;

  const baseRevenue = sampleData.metrics.revenue || 12450;
  const currentRevenue = baseRevenue + (clickMultiplier * 150);

  target.innerHTML = \`
    <div class="space-y-4">
      <div class="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h3 class="text-base font-bold text-white">📊 Executive Performance Dashboard</h3>
          <p class="text-xs text-slate-400">Live operational overview & metrics</p>
        </div>
        <span class="px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          Sync Active
        </span>
      </div>

      <!-- Stat Cards Grid -->
      <div class="grid grid-cols-3 gap-4 font-sans">
        <div class="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <p class="text-xs text-slate-400 font-medium">Calculated Revenue</p>
          <p class="text-lg font-bold text-emerald-400 font-mono mt-1">$\${currentRevenue.toLocaleString()}</p>
        </div>
        <div class="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <p class="text-xs text-slate-400 font-medium">Active Session Rate</p>
          <p class="text-lg font-bold text-indigo-400 font-mono mt-1">\${sampleData.metrics.conversionRate}%</p>
        </div>
        <div class="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <p class="text-xs text-slate-400 font-medium">Total Users</p>
          <p class="text-lg font-bold text-purple-400 font-mono mt-1">\${sampleData.metrics.activeUsers}</p>
        </div>
      </div>
    </div>
  \`;
}`
      },
      {
        path: "components/analytics.js",
        language: "javascript",
        content: `// Modular Analytics Component
export function renderAnalytics() {
  const target = document.getElementById('analytics-target');
  if (!target) return;

  target.innerHTML = \`
    <div class="space-y-3">
      <h3 class="text-sm font-bold text-slate-200 uppercase tracking-wider">📈 Network Throughput</h3>
      <div class="w-full bg-slate-950 rounded-full h-3 p-0.5 border border-slate-800">
        <div class="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-full rounded-full w-3/4 transition-all duration-500"></div>
      </div>
      <p class="text-xs text-slate-400 font-mono flex justify-between">
        <span>Capacity: 75% Utilized</span>
        <span class="text-emerald-400 font-semibold">Latency: 12ms</span>
      </p>
    </div>
  \`;
}`
      },
      {
        path: "utils/helpers.js",
        language: "javascript",
        content: `// Common Utility Helper Functions

export function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function getStoredState(key) {
  try {
    const item = localStorage.getItem('workspace_app_' + key);
    return item ? JSON.parse(item) : null;
  } catch (e) {
    return null;
  }
}

export function saveStoredState(key, val) {
  try {
    localStorage.setItem('workspace_app_' + key, JSON.stringify(val));
  } catch (e) {
    console.warn('Storage unavailable', e);
  }
}`
      },
      {
        path: "data/sampleData.json",
        language: "json",
        content: `{
  "project": "Diversified Workspace App",
  "version": "2.0.0",
  "metrics": {
    "revenue": 12450,
    "conversionRate": 94.2,
    "activeUsers": 1280
  },
  "modules": ["dashboard", "analytics", "helpers", "analyzer"]
}`
      },
      {
        path: "scripts/analyzer.py",
        language: "python",
        content: `# Workspace Data Analyzer Script
import json

def analyze_workspace():
    print("=== WORKSPACE FILES DIVERSIFIED SUMMARY ===")
    files = ["index.html", "styles.css", "script.js", "components/dashboard.js", "utils/helpers.js"]
    for f in files:
        print(f"File verified: {f}")

if __name__ == "__main__":
    analyze_workspace()`
      },
      {
        path: "README.md",
        language: "markdown",
        content: `# 🚀 Diversified Workspace Project

Welcome to your multi-module agent workspace!

## 📁 File Structure Overview
- **index.html**: Master HTML5 entry layout with Tailwind styling
- **styles.css**: Design tokens and custom theme variables
- **script.js**: Main state controller and DOM events
- **components/dashboard.js**: Interactive metrics dashboard UI
- **components/analytics.js**: Dynamic performance chart component
- **utils/helpers.js**: Formatter and localStorage utility functions
- **data/sampleData.json**: Structured JSON dataset
- **scripts/analyzer.py**: Python telemetry analyzer script
`
      }
    ]
  },
  {
    id: "react-lite",
    name: "React Component (JSX)",
    description: "A standalone React/JSX boilerplate for modeling modular frontend components.",
    icon: "Code2",
    files: [
      {
        path: "App.jsx",
        language: "jsx",
        content: `import React, { useState } from 'react';

export default function App() {
  const [todos, setTodos] = useState([
    { id: 1, text: "Learn React Agent flows", completed: true },
    { id: 2, text: "Configure custom OpenRouter key", completed: false },
    { id: 3, text: "Download finished codebase as ZIP", completed: false }
  ]);
  const [newTodo, setNewTodo] = useState("");

  const toggleTodo = (id) => {
    setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const addTodo = (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    setTodos([...todos, { id: Date.now(), text: newTodo, completed: false }]);
    setNewTodo("");
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-slate-900 text-slate-100 rounded-xl shadow-xl border border-slate-800">
      <h2 className="text-xl font-bold mb-4 text-indigo-400">📝 React Task Tracker</h2>
      
      <form onSubmit={addTodo} className="flex gap-2 mb-4">
        <input 
          type="text" 
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="New task..."
          className="flex-1 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded text-sm focus:outline-none focus:border-indigo-500"
        />
        <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded text-sm font-semibold">
          Add
        </button>
      </form>

      <ul className="space-y-2">
        {todos.map(todo => (
          <li 
            key={todo.id}
            onClick={() => toggleTodo(todo.id)}
            className="flex items-center gap-3 p-2 bg-slate-800/50 rounded hover:bg-slate-800 cursor-pointer border border-transparent hover:border-slate-700"
          >
            <input 
              type="checkbox" 
              checked={todo.completed} 
              readOnly 
              className="rounded text-indigo-600 focus:ring-0 bg-slate-900 border-slate-700"
            />
            <span className={todo.completed ? "line-through text-slate-500" : "text-slate-200"}>
              {todo.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}`
      }
    ]
  },
  {
    id: "python-utils",
    name: "Python Analyzer",
    description: "A Python utility template for structured calculations and mock telemetry parsing.",
    icon: "Terminal",
    files: [
      {
        path: "analyzer.py",
        language: "python",
        content: `import json
import math
from datetime import datetime

class CodebaseAnalyzer:
    def __init__(self, project_name):
        self.project_name = project_name
        self.scan_time = datetime.now().isoformat()
        self.files = []

    def register_file(self, path, lines_count, language):
        self.files.append({
            "path": path,
            "lines": lines_count,
            "language": language
        })

    def get_summary(self):
        total_lines = sum(f["lines"] for f in self.files)
        avg_lines = total_lines / len(self.files) if self.files else 0
        
        return {
            "project": self.project_name,
            "timestamp": self.scan_time,
            "file_count": len(self.files),
            "total_lines_of_code": total_lines,
            "average_file_length": math.ceil(avg_lines)
        }

# Sample Usage Execution
if __name__ == "__main__":
    analyzer = CodebaseAnalyzer("MyWorkspaceApp")
    analyzer.register_file("index.html", 45, "html")
    analyzer.register_file("styles.css", 120, "css")
    analyzer.register_file("script.js", 80, "javascript")
    
    report = analyzer.get_summary()
    print("=== WORKSPACE ANALYZER SUMMARY ===")
    print(json.dumps(report, indent=4))
`
      }
    ]
  },
  {
    id: "cpp-algo",
    name: "C++ Pathfinding",
    description: "A core C++ algorithm sandbox showing a Breadth-First Search matrix graph solver.",
    icon: "Cpu",
    files: [
      {
        path: "bfs_solver.cpp",
        language: "cpp",
        content: `#include <iostream>
#include <vector>
#include <queue>
#include <string>

using namespace std;

struct Point {
    int r, c;
};

// Breadth First Search Path Solver inside a grid
int solveGridPath(const vector<vector<int>>& grid, Point start, Point end) {
    int rows = grid.size();
    if (rows == 0) return -1;
    int cols = grid[0].size();
    
    vector<vector<bool>> visited(rows, vector<bool>(cols, false));
    queue<pair<Point, int>> q; // Point and steps
    
    q.push({start, 0});
    visited[start.r][start.c] = true;
    
    int dr[] = {-1, 1, 0, 0};
    int dc[] = {0, 0, -1, 1};
    
    while (!q.empty()) {
        auto [curr, steps] = q.front();
        q.pop();
        
        if (curr.r == end.r && curr.c == end.c) {
            return steps;
        }
        
        for (int i = 0; i < 4; ++i) {
            int nr = curr.r + dr[i];
            int nc = curr.c + dc[i];
            
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                if (!visited[nr][nc] && grid[nr][nc] == 0) {
                    visited[nr][nc] = true;
                    q.push({{nr, nc}, steps + 1});
                }
            }
        }
    }
    return -1; // Unreachable
}

int main() {
    // 0 = Walkable, 1 = Wall Block
    vector<vector<int>> grid = {
        {0, 0, 0, 1, 0},
        {1, 1, 0, 1, 0},
        {0, 0, 0, 0, 0},
        {0, 1, 1, 1, 0},
        {0, 0, 0, 0, 0}
    };
    
    Point start = {0, 0};
    Point end = {4, 4};
    
    int path_length = solveGridPath(grid, start, end);
    cout << "Path solved! Minimum distance: " << path_length << " steps." << endl;
    
    return 0;
}`
      }
    ]
  },
  {
    id: "java-tasks",
    name: "Java Task Manager",
    description: "A standard object-oriented Java structure modeling command-line collections.",
    icon: "Coffee",
    files: [
      {
        path: "TaskManager.java",
        language: "java",
        content: `import java.util.ArrayList;
import java.util.List;

public class TaskManager {
    static class Task {
        private String id;
        private String title;
        private boolean isDone;

        public Task(String id, String title) {
            this.id = id;
            this.title = title;
            this.isDone = false;
        }

        public void markComplete() { this.isDone = true; }
        
        @Override
        public String toString() {
            return "[" + (isDone ? "✔" : " ") + "] ID: " + id + " - " + title;
        }
    }

    private final List<Task> tasks = new ArrayList<>();

    public void addTask(String id, String title) {
        tasks.add(new Task(id, title));
    }

    public void completeTask(String id) {
        for (Task t : tasks) {
            if (t.id.equals(id)) {
                t.markComplete();
                break;
            }
        }
    }

    public void displayTasks() {
        System.out.println("--- CURRENT ACTIVE WORKSPACE TASKS ---");
        for (Task t : tasks) {
            System.out.println(t);
        }
    }

    public static void main(String[] args) {
        TaskManager manager = new TaskManager();
        manager.addTask("T-100", "Configure OpenRouter key verification");
        manager.addTask("T-101", "Design sidebar models search index");
        manager.addTask("T-102", "Enable virtual files ZIP output");
        
        manager.completeTask("T-100");
        manager.displayTasks();
    }
}`
      }
    ]
  },
  {
    id: "c-program",
    name: "C Language Program (.c)",
    description: "Full C language program with structures, memory allocation, pointers, and formatted CLI output.",
    icon: "FileCode",
    files: [
      {
        path: "main.c",
        language: "c",
        content: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// C Structure Definition
typedef struct {
    int id;
    char name[64];
    double score;
} Student;

void printStudent(const Student *s) {
    if (!s) return;
    printf("Student ID   : %d\\n", s->id);
    printf("Student Name : %s\\n", s->name);
    printf("Performance  : %.2f%%\\n", s->score);
}

int main() {
    printf("===========================================\\n");
    printf("   C Program Execution in Agent Sandbox\\n");
    printf("===========================================\\n\\n");

    Student *student1 = (Student *)malloc(sizeof(Student));
    if (student1 == NULL) {
        fprintf(stderr, "Memory allocation failed!\\n");
        return 1;
    }

    student1->id = 2026;
    strncpy(student1->name, "Developer Agent", sizeof(student1->name) - 1);
    student1->score = 99.8;

    printStudent(student1);

    int numbers[] = {12, 24, 36, 48, 60};
    int count = sizeof(numbers) / sizeof(numbers[0]);
    int sum = 0;

    for (int i = 0; i < count; i++) {
        sum += numbers[i];
    }

    printf("\\nData Array Sum : %d\\n", sum);
    printf("Data Average   : %.2f\\n", (double)sum / count);

    free(student1);
    printf("\\nC Execution completed cleanly.\\n");
    return 0;
}`
      }
    ]
  }
];
