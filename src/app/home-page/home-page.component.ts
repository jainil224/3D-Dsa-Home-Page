import { Component, AfterViewInit, OnDestroy, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroSectionComponent } from '../hero-section/hero-section.component';
import { ServicesSectionComponent } from '../services-section/services-section.component';
import { ThreeSceneComponent } from '../three-scene/three-scene.component';
import { BackgroundCanvasComponent } from '../background-canvas/background-canvas.component';
import { InteractiveSectionComponent } from '../interactive-section/interactive-section.component';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    CommonModule,
    HeroSectionComponent,
    ServicesSectionComponent,
    ThreeSceneComponent,
    BackgroundCanvasComponent,
    InteractiveSectionComponent
  ],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss'
})
export class HomePageComponent implements AfterViewInit, OnDestroy {
  public activeDS = 'Array';
  public activeStep = 0;
  public activeOp = 'Insertion';
  public opDescription = 'Scroll to watch Insert & Delete with live C++ code execution.';
  public timeComplexity = 'O(n)';
  public spaceComplexity = 'O(1)';
  public opStatus = 'Searching...';

  // 0-4 = Insert steps, 5-8 = Delete steps — drives C++ line-by-line highlighting
  public arraySubStep = 0;
  
  // 0-3 = Push steps, 4-8 = Pop steps
  public stackSubStep = 0;
  
  private triggers: any[] = [];

  constructor(private ngZone: NgZone, private cdr: ChangeDetectorRef) {}

  ngAfterViewInit() {
    setTimeout(() => {
      const threeState = (window as any).threeSceneState;

      // 1. Hero → Services approach
      this.triggers.push(ScrollTrigger.create({
        trigger: '.services-section',
        start: 'top bottom',
        end: 'top top',
        scrub: true,
        onUpdate: (self) => {
          if (threeState) {
            threeState.ptsPosTarget = 3.2 - self.progress * 8.5; 
            threeState.scrollShapeTarget = self.progress; 
          }
        }
      }));

      // 2. Services section pinning & 3D shape morphing (Centered)
      const pinningAnim = gsap.to({}, {
        scrollTrigger: {
          trigger: '.services-section',
          start: 'top top',
          end: '+=2000',
          pin: true,
          scrub: true,
          onUpdate: (self) => {
            if (threeState) {
              threeState.ptsPosTarget = 0.0; // CENTERED in the screen!
              threeState.scrollShapeTarget = 1 + self.progress * 4.0; // Morph Array (1) -> Stack (2) -> Tree (3) -> Linked List (4) -> Queue (5)
              threeState.operationType = 'none';
              threeState.highlightedCellIndex = -1;
            }
          }
        }
      });
      if (pinningAnim.scrollTrigger) this.triggers.push(pinningAnim.scrollTrigger);

      // 3. Services entrance
      const entranceAnim = gsap.fromTo('#services-header', 
        { opacity: 0, y: 30, scale: 0.95 },
        { 
          opacity: 1, y: 0, scale: 1, ease: 'power3.out', duration: 1.4,
          scrollTrigger: {
            trigger: '.services-section',
            start: 'top 75%'
          }
        }
      );
      if (entranceAnim.scrollTrigger) this.triggers.push(entranceAnim.scrollTrigger);

      // 4. Services cards entrance
      const cardsAnim = gsap.fromTo('.service-card-wrapper',
        { opacity: 0, y: 60, scale: 0.94 },
        {
          opacity: 1, y: 0, scale: 1, ease: 'power3.out', duration: 0.8, stagger: 0.12,
          scrollTrigger: {
            trigger: '.services-section',
            start: 'top 65%'
          }
        }
      );
      if (cardsAnim.scrollTrigger) this.triggers.push(cardsAnim.scrollTrigger);



      // 5.5. Transition from Services to Interactive
      this.triggers.push(ScrollTrigger.create({
        trigger: '.interactive-section',
        start: 'top bottom',
        end: 'top top',
        scrub: true,
        onUpdate: (self) => {
          if (threeState) {
            threeState.ptsPosTarget = -5.5 + (5.5 * self.progress);
            threeState.scrollShapeTarget = 5 + (2 * self.progress);
            threeState.posYTarget = 0 - (0.4 * self.progress);
            threeState.scaleTarget = 0.78 + (0.17 * self.progress);
          }
        }
      }));

      // 6. UNIFIED Interactive Section
      this.triggers.push(ScrollTrigger.create({
        trigger: '.interactive-section',
        start: 'top top',
        end: '+=1000%',
        pin: true,
        scrub: true,
        onUpdate: (self) => {
          if (threeState) {
            const p = self.progress;
            threeState.ptsPosTarget = 0;
            threeState.posYTarget = -0.4;
            threeState.scaleTarget = 0.95;

            this.ngZone.run(() => {
              // ── ARRAY SECTION (p: 0 → 0.20) — Insert then Delete ──────────────
              if (p < 0.20) {
                this.activeDS = 'Array';
                threeState.scrollShapeTarget = 6.8;
                threeState.blastProgress = 0;

                // ── Phase 0: IDLE — static array, no animation ──────────────────
                if (p < 0.02) {
                  threeState.operationType = 'none';
                  threeState.highlightedCellIndex = -1;
                  threeState.interactiveCells = [-1, -1];
                  threeState.interactiveSubProgress = 0;
                  this.activeOp = 'Insertion';
                  this.arraySubStep = 0;
                  this.opDescription = 'Scroll to watch Insert & Delete operations with live C++ code execution.';

                // ── Phase 1: INSERT (p: 0.02 → 0.10) ───────────────────────────
                } else if (p < 0.10) {
                  const localP = (p - 0.02) / 0.08; // 0 → 1
                  threeState.operationType = 'insert';
                  threeState.interactiveSubProgress = localP;
                  threeState.highlightedCellIndex = 2;
                  threeState.interactiveCells = [2, -1];
                  threeState.activeHighlightColor.setHex(0x00FF88);
                  this.activeOp = 'Insertion';

                  // Line-by-line C++ sync:
                  // Step 0 → void insert(...)      (localP 0.00 – 0.08)
                  // Step 1 → for(int i=size; ...)   (localP 0.08 – 0.20)
                  // Step 2 → arr[i] = arr[i-1]      (localP 0.20 – 0.55) ← boxes shift right
                  // Step 3 → arr[index] = value     (localP 0.55 – 0.80) ← new box drops
                  // Step 4 → size++                 (localP 0.80 – 1.00) ← done
                  if      (localP < 0.08) { this.arraySubStep = 0; }
                  else if (localP < 0.20) { this.arraySubStep = 1; }
                  else if (localP < 0.55) { this.arraySubStep = 2; }
                  else if (localP < 0.80) { this.arraySubStep = 3; }
                  else                   { this.arraySubStep = 4; }

                  this.opDescription = localP < 0.20
                    ? 'Calling insert(index=2, value=55) — preparing to shift elements right...'
                    : localP < 0.55
                    ? 'Shifting elements right → making gap at index 2...'
                    : localP < 0.80
                    ? 'Dropping element [55] into index 2...'
                    : 'Insertion complete! size++ — array grew by 1.';

                // ── Phase 2: DELETE (p: 0.10 → 0.20) ───────────────────────────
                } else {
                  const localP = (p - 0.10) / 0.10; // 0 → 1
                  threeState.operationType = 'delete';
                  threeState.interactiveSubProgress = localP;
                  threeState.highlightedCellIndex = localP < 0.56 ? 3 : 6;
                  threeState.interactiveCells    = [localP < 0.56 ? 3 : 6, -1];
                  threeState.activeHighlightColor.setHex(0xFF3333);
                  this.activeOp = 'Deletion';

                  // Line-by-line C++ sync (settle phase is 0→0.12 of subP):
                  // Step 5 → void deleteEl(...)     (localP 0.00 – 0.10)
                  // Step 6 → for(int i=index; ...)  (localP 0.10 – 0.22)
                  // Step 7 → arr[i] = arr[i+1]      (localP 0.22 – 0.70) ← elements slide left
                  // Step 8 → size--                 (localP 0.70 – 1.00) ← done
                  if      (localP < 0.10) { this.arraySubStep = 5; }
                  else if (localP < 0.22) { this.arraySubStep = 6; }
                  else if (localP < 0.70) { this.arraySubStep = 7; }
                  else                   { this.arraySubStep = 8; }

                  this.opDescription = localP < 0.22
                    ? 'Calling deleteEl(index=3) — locating element [5]...'
                    : localP < 0.70
                    ? 'Shifting remaining elements left to fill the gap...'
                    : 'Deletion complete! size-- — memory freed.';
                }

              } 
              // ── STACK SECTION (p: 0.20 → 0.40) — Push then Pop ────────────────
              else if (p < 0.40) {
                this.activeDS = 'Stack';
                threeState.scrollShapeTarget = 8;
                threeState.blastProgress = 0;

                // ── Phase 0: Transition & Morphing (p: 0.20 → 0.25) ─────────────
                if (p < 0.25) {
                  this.activeOp = 'Morphing';
                  this.opDescription = 'Converting Array to Stack (LIFO)...';
                  const localP = (p - 0.20) / 0.05;
                  threeState.scrollShapeTarget = 7 + localP;
                  threeState.interactiveCells = [-1, -1];
                  threeState.operationType = 'none';
                  threeState.highlightedCellIndex = -1;
                  threeState.interactiveSubProgress = 0;
                  this.stackSubStep = 0;
                }
                // ── Phase 1: IDLE (p: 0.25 → 0.26) ──────────────────────────────
                else if (p < 0.26) {
                  this.activeOp = 'Push';
                  this.opDescription = 'Scroll to watch Push (Last In) & Pop (First Out) with live C++ code execution.';
                  threeState.interactiveCells = [0, -1];
                  threeState.operationType = 'none';
                  threeState.highlightedCellIndex = 0;
                  threeState.interactiveSubProgress = 0;
                  this.stackSubStep = 0;
                }
                // ── Phase 2: PUSH (p: 0.26 → 0.33) ──────────────────────────────
                else if (p < 0.33) {
                  const localP = Math.min((p - 0.26) / 0.06, 1.0); // 0.26->0.32 is animation, 0.32->0.33 is hold
                  this.activeOp = 'Push';
                  threeState.operationType = 'push';
                  threeState.interactiveSubProgress = localP;
                  threeState.highlightedCellIndex = 0;
                  threeState.interactiveCells = [0, -1];
                  threeState.activeHighlightColor.setHex(0x00FF88);

                  // Line-by-line C++ sync:
                  // Step 0 → void push(...)         (localP 0.00 – 0.10)
                  // Step 1 → top++                  (localP 0.10 – 0.50) ← block dropping
                  // Step 2 → stack[top] = value     (localP 0.50 – 1.00) ← block lands
                  // Step 3 → }                      (localP 1.00)
                  if      (localP < 0.10) { this.stackSubStep = 0; }
                  else if (localP < 0.50) { this.stackSubStep = 1; }
                  else if (localP < 1.00) { this.stackSubStep = 2; }
                  else                   { this.stackSubStep = 3; }

                  this.opDescription = localP < 0.10
                    ? 'Calling push(55) — allocating memory...'
                    : localP < 0.50
                    ? 'top++ → moving TOP pointer up to make room for new element...'
                    : localP < 1.00
                    ? 'stack[top] = 55 → placing element onto the top of the stack.'
                    : 'Push complete! Element is now the new TOP (LIFO).';
                }
                // ── Phase 3: POP (p: 0.33 → 0.40) ───────────────────────────────
                else {
                  const localP = Math.min((p - 0.33) / 0.06, 1.0); // 0.33->0.39 is animation, 0.39->0.40 is hold
                  this.activeOp = 'Pop';
                  threeState.operationType = 'pop';
                  threeState.interactiveSubProgress = localP;
                  threeState.highlightedCellIndex = 0;
                  threeState.interactiveCells = [0, -1];
                  threeState.activeHighlightColor.setHex(0xFF3333);

                  // Line-by-line C++ sync:
                  // Step 4 → int pop()              (localP 0.00 – 0.10)
                  // Step 5 → value = stack[top]     (localP 0.10 – 0.30) ← identify element
                  // Step 6 → top--                  (localP 0.30 – 0.70) ← block flies up, pointer moves down
                  // Step 7 → return value           (localP 0.70 – 0.99)
                  // Step 8 → }                      (localP 1.00)
                  if      (localP < 0.10) { this.stackSubStep = 4; }
                  else if (localP < 0.30) { this.stackSubStep = 5; }
                  else if (localP < 0.70) { this.stackSubStep = 6; }
                  else if (localP < 1.00) { this.stackSubStep = 7; }
                  else                   { this.stackSubStep = 8; }

                  this.opDescription = localP < 0.10
                    ? 'Calling pop() — preparing to remove the TOP element...'
                    : localP < 0.30
                    ? 'value = stack[top] → capturing [55] before removal...'
                    : localP < 0.70
                    ? 'top-- → shifting TOP pointer down and removing element.'
                    : 'Pop complete! Memory freed and returned (LIFO).';
                }
              }
              // TREE
              else if (p < 0.60) {
                if (p < 0.45) { // Transition
                  this.activeDS = 'Tree'; this.activeOp = 'Morphing';
                  const localP = (p - 0.40) / 0.05;
                  threeState.scrollShapeTarget = 8 + localP;
                  threeState.interactiveCells = [-1, -1];
                } else { // Operations
                  this.activeDS = 'Tree';
                  threeState.scrollShapeTarget = 9;
                  const localP = (p - 0.45) / 0.15;
                  const step = Math.floor(localP * 12);
                  this.activeStep = step;
                  if (step <= 5) {
                    this.activeOp = 'Insert';
                    const insertPath = [0, 1, 4]; const tIdx = Math.min(2, Math.floor(step / 2));
                    const nodeIdx = insertPath[tIdx];
                    this.opStatus = tIdx === 2 ? 'Inserted node 10!' : 'Traversing to insert 10...';
                    threeState.interactiveCells = [nodeIdx, -1];
                    threeState.activeHighlightColor.setHex(0x00FF88);
                    threeState.operationType = 'insert';
                    threeState.highlightedCellIndex = nodeIdx;
                  } else {
                    this.activeOp = 'Delete';
                    const deletePath = [0, 2, 6]; const sIdx = Math.min(2, Math.floor((step - 6) / 2));
                    const nodeIdx = deletePath[sIdx];
                    this.opStatus = sIdx === 2 ? 'Deleted node 99!' : 'Traversing to delete 99...';
                    threeState.interactiveCells = [nodeIdx, -1];
                    threeState.activeHighlightColor.setHex(0xFF3333);
                    threeState.operationType = 'delete';
                    threeState.highlightedCellIndex = nodeIdx;
                  }
                }
              }
              // LINKED LIST
              else if (p < 0.80) {
                if (p < 0.65) { // Transition
                  this.activeDS = 'Linked List'; this.activeOp = 'Morphing';
                  const localP = (p - 0.60) / 0.05;
                  threeState.scrollShapeTarget = 9 + localP;
                  threeState.interactiveCells = [-1, -1];
                } else { // Operations
                  this.activeDS = 'Linked List';
                  threeState.scrollShapeTarget = 10;
                  const localP = (p - 0.65) / 0.15;
                  const step = Math.floor(localP * 12);
                  this.activeStep = step;
                  if (step <= 3) {
                    this.activeOp = 'Traversal'; const nodeIdx = Math.min(4, step);
                    this.opStatus = `Visiting node ${nodeIdx}...`;
                    threeState.interactiveCells = [nodeIdx, -1];
                    threeState.activeHighlightColor.setHex(0x22D3EE);
                    threeState.operationType = 'search';
                    threeState.highlightedCellIndex = nodeIdx;
                  } else if (step <= 7) {
                    this.activeOp = 'Insertion'; const nodeIdx = 4;
                    this.opStatus = step === 7 ? 'New node 50 inserted!' : 'Traversing to end...';
                    threeState.interactiveCells = [nodeIdx, -1];
                    threeState.activeHighlightColor.setHex(0x00FF88);
                    threeState.operationType = 'insert';
                    threeState.highlightedCellIndex = nodeIdx;
                  } else {
                    this.activeOp = 'Searching'; const searchIdx = Math.min(2, step - 8);
                    this.opStatus = searchIdx === 2 ? 'Value 30 found!' : `Checking node ${searchIdx}...`;
                    threeState.interactiveCells = [searchIdx, -1];
                    threeState.activeHighlightColor.setHex(0xFACC15);
                    threeState.operationType = 'search';
                    threeState.highlightedCellIndex = searchIdx;
                  }
                }
              }
              // QUEUE
              else {
                if (p < 0.85) { // Transition
                  this.activeDS = 'Queue'; this.activeOp = 'Morphing';
                  const localP = (p - 0.80) / 0.05;
                  threeState.scrollShapeTarget = 10 + localP;
                  threeState.interactiveCells = [-1, -1];
                } else { // Operations
                  this.activeDS = 'Queue';
                  threeState.scrollShapeTarget = 11;
                  const localP = (p - 0.85) / 0.15;
                  const step = Math.floor(localP * 12);
                  this.activeStep = step;
                if (step <= 3) {
                  this.activeOp = 'Enqueue'; const nodeIdx = 4;
                  this.opStatus = step === 3 ? 'Value 99 enqueued at REAR!' : 'Preparing enqueue...';
                  threeState.interactiveCells = [nodeIdx, -1];
                  threeState.activeHighlightColor.setHex(0x00FF88);
                  threeState.operationType = 'insert';
                  threeState.highlightedCellIndex = nodeIdx;
                } else if (step <= 6) {
                  this.activeOp = 'Dequeue'; const nodeIdx = 0;
                  this.opStatus = step === 6 ? 'Value 5 dequeued from FRONT!' : 'Preparing dequeue...';
                  threeState.interactiveCells = [nodeIdx, -1];
                  threeState.activeHighlightColor.setHex(0xFF3333);
                  threeState.operationType = 'delete';
                  threeState.highlightedCellIndex = nodeIdx;
                } else if (step <= 9) {
                  this.activeOp = 'getFront'; const nodeIdx = 0;
                  this.opStatus = 'Front value: 5';
                  threeState.interactiveCells = [nodeIdx, -1];
                  threeState.activeHighlightColor.setHex(0x22D3EE);
                  threeState.operationType = 'search';
                  threeState.highlightedCellIndex = nodeIdx;
                } else {
                  this.activeOp = 'getRear'; const nodeIdx = 4;
                  this.opStatus = 'Rear value: 10';
                  threeState.interactiveCells = [nodeIdx, -1];
                  threeState.activeHighlightColor.setHex(0xA855F7);
                  threeState.operationType = 'search';
                  threeState.highlightedCellIndex = nodeIdx;
                }
                }
              }
              this.cdr.detectChanges();
            });
          }
        },
        onLeave: () => {
          if (threeState) {
            threeState.interactiveCells = [-1, -1];
            threeState.operationType = 'none';
            threeState.highlightedCellIndex = -1;
          }
        }
      }));

      ScrollTrigger.refresh();
    }, 100);
  }

  public getStatusColor(): string {
    switch (this.activeOp) {
      case 'Push': case 'Enqueue': case 'Insert': return '#00FF88';
      case 'Pop': case 'Dequeue': case 'Delete': return '#F87171';
      case 'Search': case 'Searching': case 'Traversal': case 'getFront': return '#22D3EE';
      case 'Peek': case 'getRear': return '#A855F7';
      default: return '#FACC15';
    }
  }

  ngOnDestroy() {
    this.triggers.forEach(t => t.kill());
    ScrollTrigger.refresh();
  }
}
