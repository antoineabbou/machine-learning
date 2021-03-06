const THREE = require('three/build/three.js');
const glslify = require('glslify');
const MathEx = require('js-util/MathEx');
const debounce = require('js-util/debounce');

import force3 from './force3';
import Core from './Core';
import Wire from './Wire';

import Head from './Head';

import Emitter from '../init/events';


var Articles = require('../../articles.json')


export default class Boxes {
  constructor() {
    this.velocity = [0, 0, 0];
    this.acceleration = [0, 0, 0];
    this.anchor = [0, 0, 0];
    this.instances = 32;
    this.core = new Core(this.instances);
    this.wire = new Wire(this.instances);

    this.article = document.querySelector('.p-sketch-outline__article')
    this.articleTimeline = document.querySelector('.p-sketch-outline__article-origin')
    
    
    this.articleTitle = document.querySelector('.article__title')
    this.articleTheme = document.querySelector('.article__theme')
    this.articleAuthor = document.querySelector('.article__author')
    this.articleDate = document.querySelector('.article__date')
    this.articleExcerpt = document.querySelector('.article__excerpt')
    this.articleLink = document.querySelector('.article__link')
    

    this.modalOpen = false
    this.modal = document.querySelector('.article')

    this.close = document.querySelector('.cross')
    this.close.addEventListener('click', () => {
      this.hideModalTl.to(this.modal, 1, {
        yPercent: 0,
        transformOrigin: '100%',
        alpha: 0,
        ease: Quint.easeInOut,
        onComplete: () => {
          Emitter.emit('GLOBAL:HIDE')
          this.modal.style.display = 'none'
        }
      })
    })

    window.addEventListener('keyup', (e) => {
      if(e.keyCode === 27) {
        this.hideModalTl.to(this.modal, 1, {
          yPercent: 0,
          transformOrigin: '100%',
          alpha: 0,
          ease: Quint.easeInOut,
          onComplete: () => {
            this.modal.style.display = 'none'
            this.modalOpen = false
            Emitter.emit('GLOBAL:HIDE')
          }
        })
      }
    })
          
    // window.addEventListener('click', (e) => {   
    //   if (!this.modal.contains(e.target)){
    //     console.log(this.modalOpen)
        
    //     if(this.modalOpen) {
    //       this.hideModalTl.to(this.modal, 1, {
    //         yPercent: 0,
    //         transformOrigin: '100%',
    //         alpha: 0,
    //         ease: Quint.easeInOut,
    //         onComplete: () => {
    //           this.modal.style.display = 'none'
    //           this.modalOpen = false
    //           Emitter.emit('GLOBAL:HIDE')
    //         }
    //       })
    //     }
    //   }
    // });


    this.showModalTl = new TimelineLite({
      delay: 0.2,
    })

    this.hideModalTl = new TimelineLite({
      delay: 0.2
    })

    this.staggerTl = new TimelineLite({
      delay: 1
    })

    this.staggerContent = document.querySelectorAll('.stagger')

  }
  updateRotation() {
    force3.applyHook(this.velocity, this.acceleration, this.anchor, 0, 0.02);
    force3.applyDrag(this.acceleration, 0.3);
    force3.updateVelocity(this.velocity, this.acceleration, 1);
    this.core.uniforms.rotate.value = this.velocity[0];
    this.wire.uniforms.rotate.value = this.velocity[0];
  }
  rotate(delta) {
    if (!delta) return;
    this.anchor[0] -= delta * 0.05;
  }
  picked(id, isClick) {
    this.core.uniforms.pickedId.value = id;
    this.wire.uniforms.pickedId.value = id;
    if (id < this.instances && id > -1) {
      if(!Head.launchAnimation) {
        Head.launchAnimation = true
        Emitter.emit('GLOBAL:TOUCH', id)
      }
      document.body.classList.add('is-picked');
      this.article.classList.add('article-show');
      this.articleTimeline.classList.add('article-show');

      
      Articles.forEach(article => {
        if(id === article.id) {
          this.article.innerHTML = article.title
          this.articleTimeline.innerHTML = 'By ' + article.author + ', ' + article.date + ' ';

          if (isClick) {
            Emitter.emit('GLOBAL:SHOW')
            this.articleTitle.innerHTML = article.title
            this.articleTheme.innerHTML = article.theme
            this.articleDate.innerHTML = article.date
            this.articleAuthor.innerHTML = article.author
            this.articleExcerpt.innerHTML = article.summary
            this.articleLink.setAttribute('href', article.link)
            
        
            this.modal.style.display = 'block'
            this.showModalTl.to(this.modal, 1, {
              yPercent: -30,
              alpha: 1,
              transformOrigin: '100%',
              ease: Quint.easeInOut,
              onComplete: () => {    
                this.modalOpen = true
              }
            })  

          }
        }
      });
    } else {
      Head.launchAnimation = false
      document.body.classList.remove('is-picked');
      this.article.classList.remove('article-show')
      this.articleTimeline.classList.remove('article-show')
    }
  }

  render(time) {
    this.core.uniforms.time.value += time;
    this.wire.render(time);
    this.updateRotation();
  }
}
