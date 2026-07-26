/* REBUILD_TRIGGER_HASH: 7788990011 */
import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

@Component({
  selector: 'app-interactive-section',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="interactive-section" id="interactive-array">
      <div class="content-container">
        <div class="header">
          <span class="label">LIVE SIMULATION</span>
          
          <h2 *ngIf="activeOperation === 'search'">1. Linear Search <span>Operation</span></h2>
          <h2 *ngIf="activeOperation === 'delete'">2. Delete <span>Operation</span></h2>
          <h2 *ngIf="activeOperation === 'insert'">3. Insert <span>Operation</span></h2>

          <p *ngIf="activeOperation === 'search'">
            <b>Linear Search:</b> Visiting every element [10, 25, 40, 5, 8, 99, 12, 33] sequentially until target <b>33</b> is found at index 7.
          </p>
          <p *ngIf="activeOperation === 'delete'">
            <b>Delete Phase:</b> Deleting target boxes <b>"5"</b> and <b>"12"</b> from array. Remaining elements shift left into <b>6 boxes</b>.
          </p>
          <p *ngIf="activeOperation === 'insert'">
            <b>Insert Phase:</b> Inserting new box <b>"22"</b> after "25" (index 2). Array size expands to <b>7 boxes</b>.
          </p>
        </div>

        <div class="operation-card glass">
          <div class="status-bar">
            <div class="dot red"></div>
            <div class="dot yellow"></div>
            <div class="dot green"></div>
            <span class="filename">linear_search.cpp</span>
            <span class="op-badge" [ngClass]="activeOperation">
              {{ activeOperation | uppercase }} MODE
            </span>
          </div>

          <!-- 1. SEARCH CODE -->
          <div class="code-view" *ngIf="activeOperation === 'search'">
            <div class="line" [class.active]="activeCodeLine === 1"><span>1</span> <span class="keyword">int</span> <span class="func">linearSearch</span>(<span class="keyword">int</span> arr[], <span class="keyword">int</span> n, <span class="keyword">int</span> target)</div>
            <div class="line" [class.active]="activeCodeLine === 2"><span>2</span> &#123;</div>
            <div class="line" [class.active]="activeCodeLine === 3"><span>3</span> &nbsp;&nbsp;&nbsp;&nbsp;<span class="keyword">for</span>(<span class="keyword">int</span> i = 0; i &lt; n; i++)</div>
            <div class="line" [class.active]="activeCodeLine === 4"><span>4</span> &nbsp;&nbsp;&nbsp;&nbsp;&#123;</div>
            <div class="line" [class.active]="activeCodeLine === 5"><span>5</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="keyword">if</span>(arr[i] == target) <span class="comment">// Inspecting slot #{{ activeTargetIndex }}</span></div>
            <div class="line" [class.active]="activeCodeLine === 6"><span>6</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&#123;</div>
            <div class="line" [class.active]="activeCodeLine === 7"><span>7</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="keyword">return</span> i; <span class="comment">// Target 33 FOUND!</span></div>
            <div class="line" [class.active]="activeCodeLine === 8"><span>8</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&#125;</div>
            <div class="line" [class.active]="activeCodeLine === 9"><span>9</span> &nbsp;&nbsp;&nbsp;&nbsp;&#125;</div>
            <div class="line" [class.active]="activeCodeLine === 10"><span>10</span> &nbsp;&nbsp;&nbsp;&nbsp;<span class="keyword">return</span> -1;</div>
            <div class="line" [class.active]="activeCodeLine === 11"><span>11</span> &#125;</div>
          </div>

          <!-- 2. DELETE CODE -->
          <div class="code-view" *ngIf="activeOperation === 'delete'">
            <div class="line" [class.active]="activeCodeLine === 1"><span>1</span> <span class="keyword">def</span> <span class="func">delete_elements</span>(arr, targets):</div>
            <div class="line" [class.active]="activeCodeLine === 2"><span>2</span> &nbsp;&nbsp;&nbsp;&nbsp;<span class="comment"># Delete "5" and "12" from array</span></div>
            <div class="line" [class.active]="activeCodeLine === 3"><span>3</span> &nbsp;&nbsp;&nbsp;&nbsp;arr.remove(5) <span class="comment"># Remove "5"</span></div>
            <div class="line" [class.active]="activeCodeLine === 4"><span>4</span> &nbsp;&nbsp;&nbsp;&nbsp;arr.remove(12) <span class="comment"># Remove "12"</span></div>
            <div class="line" [class.active]="activeCodeLine === 5"><span>5</span> &nbsp;&nbsp;&nbsp;&nbsp;<span class="keyword">return</span> arr <span class="comment"># 6 boxes remaining</span></div>
          </div>

          <!-- 3. INSERT CODE -->
          <div class="code-view" *ngIf="activeOperation === 'insert'">
            <div class="line" [class.active]="activeCodeLine === 1"><span>1</span> <span class="keyword">def</span> <span class="func">insert_after</span>(arr, target_val, new_val):</div>
            <div class="line" [class.active]="activeCodeLine === 2"><span>2</span> &nbsp;&nbsp;&nbsp;&nbsp;<span class="comment"># Insert "22" after "25" at index 2</span></div>
            <div class="line" [class.active]="activeCodeLine === 3"><span>3</span> &nbsp;&nbsp;&nbsp;&nbsp;<span class="keyword">for</span> i <span class="keyword">in</span> <span class="func">range</span>(<span class="func">len</span>(arr)-1, idx, -1):</div>
            <div class="line" [class.active]="activeCodeLine === 4"><span>4</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;arr[i] = arr[i-1] <span class="comment"># Shift right</span></div>
            <div class="line" [class.active]="activeCodeLine === 5"><span>5</span> &nbsp;&nbsp;&nbsp;&nbsp;arr[2] = 22 <span class="comment"># Insert 22 (7 boxes total)</span></div>
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-box glass">
            <span class="stat-label">CURRENT OPERATION</span>
            <span class="stat-value" [ngStyle]="{'color': getOpColor(activeOperation)}">
              {{ activeOperation | uppercase }}
            </span>
          </div>
          <div class="stat-box glass">
            <span class="stat-label">ARRAY SIZE</span>
            <span class="stat-value" style="color: #22D3EE;">
              {{ activeOperation === 'search' ? '8 BOXES' : activeOperation === 'delete' ? '6 BOXES' : '7 BOXES' }}
            </span>
          </div>
          <div class="stat-box glass">
            <span class="stat-label">TARGET INDEX</span>
            <span class="stat-value">#{{ activeTargetIndex >= 0 ? activeTargetIndex : 'NULL' }}</span>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .interactive-section {
      min-height: 320vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 150px 5%;
      position: relative;
      z-index: 20;
      background: #01040F;
    }
    .content-container {
      max-width: 1200px;
      width: 100%;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 60px;
      align-items: center;
    }
    .header {
      .label {
        color: #22D3EE;
        font-family: 'JetBrains Mono', monospace;
        font-size: 14px;
        letter-spacing: 2px;
        display: block;
        margin-bottom: 10px;
      }
      h2 {
        font-size: 48px;
        color: white;
        margin-bottom: 20px;
        span {
          background: linear-gradient(to right, #22D3EE, #38BDF8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      }
      p {
        color: #94A3B8;
        font-size: 18px;
        line-height: 1.6;
        max-width: 500px;
        b { color: #FACC15; }
      }
    }
    .operation-card {
      border-radius: 12px;
      overflow: hidden;
      font-family: 'JetBrains Mono', monospace;
      .status-bar {
        background: rgba(255,255,255,0.05);
        padding: 12px 18px;
        display: flex;
        align-items: center;
        gap: 8px;
        border-bottom: 1px solid rgba(56,189,248,0.2);
        .dot { width: 10px; height: 10px; border-radius: 50%; }
        .red { background: #FF5F56; }
        .yellow { background: #FFBD2E; }
        .green { background: #27C93F; }
        .filename { color: #94A3B8; font-size: 13px; margin-left: 10px; font-weight: 600; }
        .op-badge {
          margin-left: auto;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1px;
          padding: 4px 10px;
          border-radius: 4px;
          &.search { background: rgba(250, 204, 21, 0.15); color: #FACC15; border: 1px solid rgba(250, 204, 21, 0.4); }
          &.delete { background: rgba(255, 51, 51, 0.15); color: #FF3333; border: 1px solid rgba(255, 51, 51, 0.4); }
          &.insert { background: rgba(0, 255, 136, 0.15); color: #00FF88; border: 1px solid rgba(0, 255, 136, 0.4); }
        }
      }
      .code-view {
        padding: 24px;
        background: rgba(2, 6, 23, 0.85);
        .line {
          color: #94A3B8;
          font-size: 15px;
          margin-bottom: 8px;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          border-radius: 6px;
          padding: 4px 8px;
          border-left: 3px solid transparent;
          span:first-child { color: #475569; margin-right: 16px; user-select: none; }
          &.active {
            color: #FFFFFF;
            transform: translateX(8px);
            background: rgba(59, 130, 246, 0.22);
            border-left: 3px solid #3B82F6;
            box-shadow: 0 0 16px rgba(59, 130, 246, 0.35);
          }
        }
        .keyword { color: #38BDF8; font-weight: 600; }
        .func { color: #22D3EE; font-weight: 600; }
        .comment { color: #64748B; font-style: italic; }
      }
    }
    .stats-grid {
      grid-column: 1 / span 2;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin-top: 30px;
    }
    .stat-box {
      padding: 24px;
      text-align: center;
      border-radius: 12px;
      .stat-label { color: #64748B; font-size: 12px; letter-spacing: 1px; display: block; margin-bottom: 8px; }
      .stat-value { font-size: 28px; font-weight: bold; }
    }
    .glass {
      background: rgba(255, 255, 255, 0.03);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(56, 189, 248, 0.2);
    }
    @media (max-width: 900px) {
      .content-container { grid-template-columns: 1fr; }
      .stats-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class InteractiveSectionComponent implements AfterViewInit, OnDestroy {
  activeCodeLine = 1;
  activeOperation: 'search' | 'delete' | 'insert' = 'search';
  activeTargetIndex = -1;
  private trigger: ScrollTrigger | null = null;

  getOpColor(op: string): string {
    switch (op) {
      case 'search': return '#FACC15';
      case 'delete': return '#FF3333';
      case 'insert': return '#00FF88';
      default: return '#22D3EE';
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      const threeState = (window as any).threeSceneState;
      this.trigger = ScrollTrigger.create({
        trigger: '.interactive-section',
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
        onEnter: () => { if (threeState) threeState.isInteractiveSectionActive = true; },
        onEnterBack: () => { if (threeState) threeState.isInteractiveSectionActive = true; },
        onLeave: () => { if (threeState) threeState.isInteractiveSectionActive = false; },
        onLeaveBack: () => { if (threeState) threeState.isInteractiveSectionActive = false; },
        onUpdate: (self) => {
          if (!threeState) return;
          threeState.isInteractiveSectionActive = true;
          threeState.scrollShapeTarget = 6.8;
          const p = self.progress;

          if (p < 0.33) {
            // ── 1. LINEAR SEARCH (Progress 0.00 to 0.33): Scan 10 -> 25 -> 40 -> 5 -> 8 -> 99 -> 12 -> 33 ──
            this.activeOperation = 'search';
            const subP = p / 0.33;
            threeState.operationType = 'search';
            threeState.interactiveSubProgress = subP;

            const stepVal = subP * 8;
            const checkIdx = Math.min(7, Math.floor(stepVal));
            const innerFrac = stepVal - Math.floor(stepVal);
            threeState.highlightedCellIndex = checkIdx;
            this.activeTargetIndex = checkIdx;

            if (checkIdx < 7) {
              this.activeCodeLine = innerFrac < 0.4 ? 3 : 5; // for(...) -> if(arr[i] == target)
            } else {
              this.activeCodeLine = 7; // return i; (Target 33 Found!)
            }
          } else if (p < 0.66) {
            // ── 2. DELETE PHASE (Progress 0.33 to 0.66) ──
            this.activeOperation = 'delete';
            const subP = (p - 0.33) / 0.33;
            threeState.operationType = 'delete';
            threeState.interactiveSubProgress = subP;

            if (subP < 0.5) {
              threeState.highlightedCellIndex = 3; // Delete "5" at index 3
              this.activeTargetIndex = 3;
              this.activeCodeLine = 3; // arr.remove(5)
            } else {
              threeState.highlightedCellIndex = 6; // Delete "12" at index 6
              this.activeTargetIndex = 6;
              this.activeCodeLine = 4; // arr.remove(12)
            }
          } else {
            // ── 3. INSERT PHASE (Progress 0.66 to 1.00) ──
            this.activeOperation = 'insert';
            const subP = (p - 0.66) / 0.34;
            threeState.operationType = 'insert';
            threeState.interactiveSubProgress = subP;

            threeState.highlightedCellIndex = 1; // Insert after "25" (index 1) -> slot 2
            this.activeTargetIndex = 2;

            if (subP < 0.4) {
              this.activeCodeLine = 3; // for i in range(...) -> Shift right
            } else {
              this.activeCodeLine = 5; // arr[2] = 22 -> Insert 22
            }
          }
        }
      });
    }, 150);
  }

  ngOnDestroy() {
    if (this.trigger) this.trigger.kill();
  }
}
