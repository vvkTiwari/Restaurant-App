import { Component, OnInit  } from '@angular/core' ;
import {Dish} from '../shared/dish' ;
import { DishService } from '../services/dish.service';

import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import 'rxjs/add/operator/switchMap';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

import { Comment } from '../shared/comment';


@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss']
})

export class DishdetailComponent implements OnInit {
	

	dish: Dish;
  dishIds: number[];
  prev: number;
  next: number;

  comment: Comment;
  commentForm: FormGroup;
  formErrors = {
  'author': '',
  'comment': '',

};

  validationMessages = {
  'author': {
    'required':      'Author Name is required.',
    'minlength':     'Author Name must be at least 2 characters long.',
  },
  'comment': {
    'required':      'Comment is required.'
  }
};
  


  
  constructor(private dishservice: DishService, 
  private route: ActivatedRoute,
  private location: Location,
  private fb: FormBuilder) {
    this.createForm();
   }

  ngOnInit() {

     this.dishservice.getDishIds().subscribe(dishIds => this.dishIds = dishIds);
    this.route.params
      .switchMap((params: Params) => this.dishservice.getDish(+params['id']))
      .subscribe(dish => { this.dish = dish; this.setPrevNext(dish.id); });
  }

  setPrevNext(dishId: number) {
    let index = this.dishIds.indexOf(dishId);
    this.prev = this.dishIds[(this.dishIds.length + index - 1)%this.dishIds.length];
    this.next = this.dishIds[(this.dishIds.length + index + 1)%this.dishIds.length];
    }

  goBack():void {
  	this.location.back();
  }

  createForm() {
    this.commentForm = this.fb.group({
      author:  ['', [Validators.required, Validators.minLength(2)] ],
      rating: 5,
      comment:  ['', [Validators.required] ],
    });
    this.commentForm.valueChanges.subscribe(data => this.onValueChanged(data));
    this.onValueChanged(); 
  }


  onSubmit() {
    this.comment= this.commentForm.value;
    this.comment.date= (new Date).toISOString();
    this.dish.comments.push(this.comment);
    console.log(this.comment);
    this.commentForm.reset({
      author: '',
      rating: 5,
      comment: '',

    });
  }

  onValueChanged(data?: any) {
    if (!this.commentForm) { return; } 
    const form = this.commentForm;
    for (const field in this.formErrors) {
      // clear previous error message (if any)
      this.formErrors[field] = '';
      const control = form.get(field);
      if (control && control.dirty && !control.valid) {
        const messages = this.validationMessages[field];
        for (const key in control.errors) {
          this.formErrors[field] += messages[key] + ' ';
        }
      }
    }
   }


}
